import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios';


export default function Home() {
  const messageEl = useRef<any>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState("session")

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener('DOMNodeInserted', (event: any) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
    if(localStorage.getItem("chat_s")) setSession(localStorage.getItem("chat_s") as any)
    else {
      const tempS = Date.now().toString(32) + Math.random()
      setSession(tempS)
      localStorage.setItem("chat_s", tempS)
    }
  }, [])

  const sendHandle = async () => {
    if (loading) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("")
    await axios({
      method: "post",
      url: "/api/hello",
      data: {
        session,
        message: input
      }
    }).then(({ data }) => setMessages(data)).catch(e => alert(e.message))
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Chat with Mongolia</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className='chatbox'>
          <div className='chatarea' ref={messageEl}>
            {messages.map((el, i) =>
              <div key={Date.now().toString(32)+i} className={el.role === "user" ? "message-right" : "message-left"}>
                <span style={{ fontWeight: "bold" }}>{el.role}</span>
                <p>
                  {el.content}
                </p>
              </div>
            )}
          </div>
          <input placeholder='Асуух зүйлээ бичнэ үү.' onKeyDown={e => { if (e.key === "Enter") sendHandle() }} value={input} onChange={(e) => setInput(e.target.value)} />
          <button onClick={sendHandle}>send</button>
        </div>
      </main>
    </>
  )
}
