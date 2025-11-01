import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, Wallet, CheckCircle2, XCircle, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import type { Message, ChatResponse, Transaction } from "@shared/schema";

type MessageWithTransaction = Message & { transaction?: Transaction };

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageWithTransaction[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isWalletValid, setIsWalletValid] = useState(false);
  const [showWalletInput, setShowWalletInput] = useState(true);
  const [walletValidationError, setWalletValidationError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const validateWallet = async (address: string) => {
    if (!address || address.length < 32) {
      setWalletValidationError("Please enter a valid Solana wallet address");
      setIsWalletValid(false);
      return false;
    }

    try {
      const res = await apiRequest("POST", "/api/validate-wallet", { address });
      const response = await res.json();
      
      if (response.valid) {
        setIsWalletValid(true);
        setWalletValidationError("");
        setShowWalletInput(false);
        toast({
          title: "Wallet connected",
          description: "You can now start chatting and earning USDC!",
        });
        return true;
      } else {
        setWalletValidationError(response.error || "Invalid wallet address");
        setIsWalletValid(false);
        return false;
      }
    } catch (error: any) {
      setWalletValidationError(error.message || "Failed to validate wallet address");
      setIsWalletValid(false);
      return false;
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const userMessage: MessageWithTransaction = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      const res = await apiRequest("POST", "/api/chat", {
        message,
        walletAddress,
        conversationHistory: messages.map(({ transaction, ...msg }) => msg),
      });
      
      const response = await res.json() as ChatResponse;
      
      return response;
    },
    onSuccess: (data) => {
      const messageWithTransaction: MessageWithTransaction = {
        ...data.message,
        transaction: data.transaction,
      };
      
      setMessages(prev => [...prev, messageWithTransaction]);
      
      if (data.transaction && data.transaction.status === "success") {
        toast({
          title: "USDC Sent! 🎉",
          description: `0.001 USDC transferred to your wallet`,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to send message. Please try again.";
      
      let title = "Error";
      let description = errorMessage;
      
      if (errorMessage.includes("503")) {
        if (errorMessage.includes("AI service") || errorMessage.includes("MISTRAL_API_KEY")) {
          title = "AI Service Not Configured";
          description = "The Mistral AI service is not set up. Please add MISTRAL_API_KEY to your secrets.";
        } else if (errorMessage.includes("Payment service") || errorMessage.includes("SOLANA_PRIVATE_KEY")) {
          title = "Payment Service Not Configured";
          description = "The Solana payment service is not set up. Please add SOLANA_PRIVATE_KEY to your secrets.";
        }
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
      
      setMessages(prev => prev.slice(0, -1));
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!isWalletValid) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Solana wallet first",
        variant: "destructive",
      });
      return;
    }

    const message = inputMessage.trim();
    setInputMessage("");
    chatMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold">AI Chat</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isWalletValid && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Connected</span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowWalletInput(true);
                    setIsWalletValid(false);
                  }}
                  data-testid="button-disconnect-wallet"
                >
                  <Wallet className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Badge variant="outline" className="gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Devnet
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {showWalletInput && !isWalletValid && (
            <div className="p-4">
              <Card className="mx-auto max-w-md p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="wallet-input" className="text-sm font-medium flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Solana Wallet Address
                    </label>
                    <Input
                      id="wallet-input"
                      type="text"
                      placeholder="Enter your Solana wallet address"
                      className="font-mono text-sm"
                      value={walletAddress}
                      onChange={(e) => {
                        setWalletAddress(e.target.value);
                        setWalletValidationError("");
                      }}
                      data-testid="input-wallet-address"
                    />
                    {walletValidationError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {walletValidationError}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => validateWallet(walletAddress)}
                    className="w-full"
                    data-testid="button-connect-wallet"
                  >
                    Connect Wallet
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    You'll receive 0.001 USDC for each message you send
                  </p>
                </div>
              </Card>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-32" data-testid="chat-messages-container">
            <div className="mx-auto max-w-3xl px-4 md:px-6 py-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4 text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Start a conversation</h2>
                    <p className="text-muted-foreground max-w-sm">
                      Messages will appear here. You'll receive 0.001 USDC for each interaction.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      transaction={message.transaction}
                    />
                  ))}
                  
                  {chatMutation.isPending && <TypingIndicator />}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-3xl p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isWalletValid ? "Type your message..." : "Connect wallet to start chatting"}
                  className="flex-1 min-h-[44px] max-h-[200px] px-6 py-3 text-base rounded-full border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={!isWalletValid || chatMutation.isPending}
                  rows={1}
                  data-testid="input-message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputMessage.trim() || !isWalletValid || chatMutation.isPending}
                  className="w-11 h-11 rounded-full flex-shrink-0"
                  data-testid="button-send-message"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message, transaction }: { message: MessageWithTransaction; transaction?: Transaction }) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`} data-testid={`message-${message.role}`}>
      {!isUser && (
        <span className="text-xs text-muted-foreground mb-1 ml-1">AI Assistant</span>
      )}
      
      <div className={`max-w-[85%] md:max-w-2xl`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border'
          }`}
        >
          <p className="text-base whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>

        {transaction && !isUser && (
          <TransactionNotification transaction={transaction} />
        )}
      </div>
    </div>
  );
}

function TransactionNotification({ transaction }: { transaction: Transaction }) {
  const explorerUrl = `https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`;

  return (
    <Card className="mt-2 p-3" data-testid="transaction-notification">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {transaction.status === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : transaction.status === "failed" ? (
            <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">
              {transaction.status === "success" && "0.001 USDC sent"}
              {transaction.status === "pending" && "Sending USDC..."}
              {transaction.status === "failed" && "Transfer failed"}
            </p>
            {transaction.error && (
              <p className="text-xs text-muted-foreground truncate">{transaction.error}</p>
            )}
          </div>
        </div>

        {transaction.status === "success" && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0"
            data-testid="link-transaction-explorer"
          >
            View
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </Card>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start" data-testid="typing-indicator">
      <div className="bg-card border rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
