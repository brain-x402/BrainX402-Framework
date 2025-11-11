# 🧠 ReacotX402 Framework  
### _Reverse Program of Pay-as-you-go — “Get-as-you-go”_

![Banner](https://raw.githubusercontent.com/reactor-x402/ReactorX402-Framework/main/assets/banner.png)

---

## 🧩 Overview

**ReacotX402** is an advanced AI-integrated blockchain framework built to **reverse the pay-per-use economy**.  
Instead of users paying per AI or computational interaction, ReacotX402 rewards contributors, developers, and AI agents **for usage itself** — creating a **self-sustaining “Get per use” protocol**.

The system operates across **AI agents**, **IoT devices**, and **Solana-based smart contracts**.  
Each interaction between user agents, AI systems, and blockchain nodes generates **work proofs** that result in automated **payments** from the protocol pool.

---

## 🧬 Reverse Program Concept

Traditionally:  
> 🧾 You Get Pay to use AI.

In **ReacotX402**:  
> 💰 You earn when AI (or users) use your agents.

The framework connects your **AI service logic** to Solana programs managing:
- 🔹 _Identity Registry_ (agent ownership and verification)  
- 🔹 _Payment Protocol_ (smart contracts for get-per-use model)  
- 🔹 _Reputation Registry_ (on-chain performance & trust scoring)

---

## 🧠 Architecture Flow

![Architecture Diagram](https://raw.githubusercontent.com/reactor-x402/ReactorX402-Framework/main/assets/architecture.jpg)


**Flow Summary:**
1. **User (Agent)** initiates interaction.  
2. **AI Service (Python + SDKs)** processes and triggers blockchain events.  
3. **Solana Smart Contracts** handle proof-of-work and rewards.  
4. The **Identity** and **Reputation Registries** maintain decentralized AI records.  
5. Service completion triggers **automated reward distribution**.  

---

## ⚙️ Tech Stack

| Layer | Technology |
|:------|:------------|
| 🧩 Frontend | Vite, Tailwind, React |
| ⚡ Backend | Python, Node, Rust (Solana) |
| 🔗 Blockchain | Solana Smart Contracts |
| 🧠 AI & IoT | Integrated Python SDKs |
| 🧱 Core Language | **Rust 96.5%**, Shell, C, Python |

---

## 🔮 Visual Identity

| Symbol | Description |
|:-------|:-------------|
| ![Logo](https://raw.githubusercontent.com/reactor-x402/ReactorX402-Framework/main/assets/logo.jpg) | The “X” reactor logo — representing the neural and blockchain fusion of AI & computation. |
| ![Reactor Vision](https://raw.githubusercontent.com/reactor-x402/ReactorX402-Framework/main/assets/brainx_screen.png) | Visualizing ReactorX402 core — AI reacting through encrypted machine data streams. |



---

## 🚀 Key Features

- 💡 **Reverse Payment Protocol** — Users get paid per AI/IoT task execution.  
- 🔗 **Solana Integration** — High-speed, low-cost smart contracts.  
- 🧠 **AI Processing Layer** — Python-based, modular, and agent-friendly.  
- 🔒 **Identity Registry** — On-chain verification of every AI agent.  
- ⭐ **Reputation Proofs** — Tracks historical trust scores and work efficiency.  

---

⚙️ Installation & Setup

Follow these steps to install and run ReactorX402 locally.

1. Clone the Repository
git clone https://github.com/brain-x402/ReactorX402-Framework.git
cd ReactorX402-Framework

2. Install Node.js Dependencies

Used for front-end or control interface.

npm install


Make sure you have Node.js v18+ and npm v9+ installed.

3. Set Up the Python AI Backend

This module handles the local reasoning engine and neural computations.

python server/index.py


Note: Requires Python 3.9+ and packages listed in requirements.txt.
Install them by running:

pip install -r requirements.txt

4. Configure Solana Environment

ReactorX402’s computation logic is powered by Solana smart contracts.

Install Solana CLI

If you haven’t already:

sh -c "$(curl -sSfL https://release.solana.com/v1.17.5/install)"


Then verify:

solana --version

Configure Wallet
solana-keygen new
solana config set --url https://api.devnet.solana.com

5. Build and Deploy Smart Contracts

Compile the ReactorX402 Solana program (written in Rust):

cargo build-bpf


Deploy it to the network:

solana program deploy target/deploy/ReactorX402.so


On success, note the Program ID — this will be required for linking with the AI backend.

🧠 Local Development Mode

To run both AI and blockchain services together:

npm run dev


This initializes:

The React/Node interface

The Python AI Core

The Solana connection laye

# Run the local AI backend
python server/index.py

# Deploy smart contracts (Solana)
cargo build-bpf
solana program deploy target/deploy/ReacotX402.so
