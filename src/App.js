// Replace the existing Firebase imports with these modular imports
import React, { useRef, useState } from 'react';
import './App.css';

// Modern Firebase v9 imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, collection, orderBy, limit, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// React Firebase hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkdAa_E1vrHFDCaim90nCxbasDhfa8czc",
  authDomain: "superchat-69e8c.firebaseapp.com",
  projectId: "superchat-69e8c",
  storageBucket: "superchat-69e8c.appspot.com",
  messagingSenderId: "539310465442",
  appId: "1:539310465442:web:b7d7719c28bb59245512fb",
  measurementId: "G-YF3SP876DS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogleHandler = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  }

  return (
    <div className="sign-in-container">
      <button className="sign-in" onClick={signInWithGoogleHandler}>Sign in with Google</button>
      <p className="community-guidelines">Do not violate the community guidelines or you will be banned for life!</p>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages, loading, error] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) return;
    
    try {
      setIsSubmitting(true);
      const { uid, photoURL } = auth.currentUser;

      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL
      });

      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <main>
        {error && <p className="error-message">Error loading messages: {error.message}</p>}
        {loading && <p className="loading-message">Loading messages...</p>}
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input 
          value={formValue} 
          onChange={(e) => setFormValue(e.target.value)} 
          placeholder="Type a message..."
          disabled={isSubmitting}
        />
        <button type="submit" disabled={!formValue.trim() || isSubmitting}>
          {isSubmitting ? '...' : '🕊️'}
        </button>
      </form>
    </>
  )
}


function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';
  
  // Format timestamp if available
  const formattedDate = createdAt?.toDate ? 
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(createdAt.toDate()) : '';

  return (
    <div className={`message ${messageClass}`}>
      <img 
        src={photoURL || 'https://ui-avatars.com/api/?name=User&background=random'} 
        alt="User avatar"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
        }}
      />
      <div className="message-content">
        <p>{text}</p>
        {formattedDate && <span className="timestamp">{formattedDate}</span>}
      </div>
    </div>
  )
}


export default App;