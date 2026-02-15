# Architecture Diagrams

Visual architecture diagrams for the Dakshin Delights project. Render with any Mermaid-compatible viewer (GitHub, VS Code Mermaid extension, etc.).

---

## 1. Component Hierarchy

```mermaid
graph TD
    App["App
    (cart state, addToCart, removeFromCart)"]
    App --> Router["HashRouter"]
    Router --> Navbar["Navbar
    props: cartCount"]
    Router --> Main["main (flex-grow)"]
    Router --> Footer["Footer"]
    Router --> LiveAssistant["LiveAssistant
    (floating widget, global)"]

    Main --> Routes["Routes"]
    Routes --> Home["Home
    props: addToCart"]
    Routes --> Menu["Menu
    props: addToCart"]
    Routes --> Checkout["Checkout
    props: cart, removeFromCart"]
    Routes --> Orders["Orders"]
    Routes --> Tracking["Tracking"]
    Routes --> Studio["Studio"]

    Studio --> GeminiService["GeminiService
    (static methods)"]
    LiveAssistant --> GeminiLive["Gemini Live API
    (WebSocket)"]
```

---

## 2. Routing Map

```mermaid
graph LR
    HR["HashRouter"] --> R["Routes"]
    R -->|"/"| Home["Home"]
    R -->|"/menu"| Menu["Menu"]
    R -->|"/checkout"| Checkout["Checkout"]
    R -->|"/orders"| Orders["Orders"]
    R -->|"/tracking/:id"| Tracking["Tracking"]
    R -->|"/studio"| Studio["Studio"]

    Navbar["Navbar Links"] -.->|Home| Home
    Navbar -.->|Menu| Menu
    Navbar -.->|My Orders| Orders
    Navbar -.->|Studio| Studio
    Navbar -.->|Cart icon| Checkout
```

---

## 3. Cart Data Flow

```mermaid
flowchart TD
    subgraph App["App.tsx"]
        State["useState&lt;CartItem[]&gt;()"]
        AddFn["addToCart(item: MenuItem)
        - Find existing → increment qty
        - New → append with qty 1"]
        RemoveFn["removeFromCart(id: string)
        - Filter out by menuItem.id"]
        CountCalc["cartCount = cart.reduce(sum qty)"]
        State --> AddFn
        State --> RemoveFn
        State --> CountCalc
    end

    CountCalc -->|"cartCount"| Navbar
    AddFn -->|"addToCart"| Home
    AddFn -->|"addToCart"| Menu
    RemoveFn -->|"removeFromCart"| Checkout
    State -->|"cart"| Checkout

    subgraph Types["types.ts"]
        MI["MenuItem
        id, name, price, category,
        dietary, spiceLevel, ..."]
        CI["CartItem
        menuItem: MenuItem
        quantity: number"]
    end

    Constants["constants.ts
    MENU_ITEMS: MenuItem[]"] -->|static data| Home
    Constants -->|static data| Menu
```

---

## 4. Gemini API Integration

```mermaid
flowchart LR
    subgraph Studio["Studio Page"]
        Prompt["User enters prompt"]
        GenBtn["Generate Image"]
        AnimBtn["Animate Image"]
    end

    subgraph GeminiService["geminiService.ts"]
        GenImg["generateImage(prompt, size)
        Model: gemini-3-pro-image-preview
        Returns: base64 data URI"]
        AnimImg["animateImage(base64, prompt, isPortrait)
        Model: veo-3.1-fast-generate-preview
        Polls operation until done
        Returns: blob object URL"]
    end

    subgraph GoogleAPI["Google Gemini API"]
        GenAPI["ai.models.generateContent"]
        VeoAPI["ai.models.generateVideos"]
        OpsAPI["ai.operations.getVideosOperation"]
    end

    Prompt --> GenBtn --> GenImg --> GenAPI
    GenAPI -->|"base64 image"| GenImg
    GenImg -->|"data:image/png;base64,..."| Studio

    AnimBtn --> AnimImg --> VeoAPI
    VeoAPI -->|"operation"| OpsAPI
    OpsAPI -->|"poll every 10s"| OpsAPI
    OpsAPI -->|"video URI"| AnimImg
    AnimImg -->|"blob URL"| Studio

    ENV[".env.local
    GEMINI_API_KEY"] -.->|"process.env.API_KEY"| GeminiService
```

---

## 5. LiveAssistant Audio Pipeline

```mermaid
sequenceDiagram
    participant User
    participant Browser as Browser (Microphone)
    participant LA as LiveAssistant Component
    participant WS as Gemini Live API (WebSocket)
    participant Speaker as Browser (Speaker)

    User->>LA: Click "Start Voice Chat"
    LA->>LA: Create AudioContext (16kHz input, 24kHz output)
    LA->>Browser: getUserMedia({ audio: true })
    Browser-->>LA: MediaStream
    LA->>WS: ai.live.connect()
    Note over LA,WS: Model: gemini-2.5-flash-native-audio-preview<br/>Persona: Chef Amara<br/>Voice: Kore<br/>Modality: AUDIO

    WS-->>LA: onopen callback
    LA->>LA: Status → "listening"
    LA->>LA: Create ScriptProcessor (4096 samples)

    loop Every audio buffer (4096 samples)
        Browser->>LA: Float32 PCM audio chunk
        LA->>LA: Convert Float32 → Int16 → Base64
        LA->>WS: sendRealtimeInput({ media: PCM@16kHz })
    end

    WS-->>LA: onmessage (modelTurn with audio)
    LA->>LA: Status → "speaking"
    LA->>LA: Decode Base64 → Int16 → AudioBuffer@24kHz
    LA->>Speaker: Schedule playback via AudioBufferSourceNode
    Note over LA,Speaker: Gapless playback using<br/>nextStartTime tracking

    WS-->>LA: onmessage (interrupted)
    LA->>Speaker: Stop all playing sources
    LA->>LA: Reset nextStartTime, status → "listening"

    User->>LA: Click "Stop Chatting"
    LA->>LA: Status → "idle"
    LA->>Browser: window.location.reload() (cleanup)
```

---

## Data Model Summary

```mermaid
classDiagram
    class MenuItem {
        +string id
        +string name
        +string description
        +number price
        +string image
        +string category
        +number rating
        +VEG|NON-VEG dietary
        +Mild|Medium|Spicy spiceLevel
        +boolean isSpecial
    }

    class CartItem {
        +MenuItem menuItem
        +number quantity
        +string customization
    }

    class Order {
        +string id
        +string date
        +CartItem[] items
        +number total
        +DELIVERED|CANCELLED|PREPARING|ON_THE_WAY status
        +string eta
    }

    CartItem --> MenuItem : contains
    Order --> CartItem : contains 1..*
```
