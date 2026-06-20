//import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Button from "./components/Button";
import Bar from "./components/Bar";
import { useMemo, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Network } from '@capacitor/network';
import { nativeStorage } from './storage';

function App() {
  //authentication methods
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState(null)
  const clearNotifications = () => {
    setError("")
    setSuccess("")
  }
  useEffect(() => {
    if (!error && !success) return
    const timer = setTimeout(() => {
      setError("")
      setSuccess("")
    }, 2500)
    return () => clearTimeout(timer)
  }, [error, success])

  useEffect(() => {
    supabase.auth.getSession().then(({ data : { session }}) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('onAuthStateChange', event, session)
    setUser(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
  }, [])
  //holds all topic objects, initialised with a template
  const [topics, setTopics] = useState([]);
  
  useEffect(() => {
    const processOfflineQueues = async () => {
      const status = await Network.getStatus()
      if(!status.connected || !user) return
      const rawAdds = await nativeStorage.getItem("offlineAddQueue")
      const addQueue = JSON.parse(rawAdds || "[]")
      if (addQueue.length > 0) {
        console.log(`Processing ${addQueue.length} offline additions...`)
        let remainingAdds = [...addQueue]
        for (const item of addQueue) {
          const {data, error} = await supabase
          .from("topics")
          .insert([{ title:item.title, content: item.content, user_id: user.id }])
          .select()
          .single()
          if (!error) {
            setTopics(prev => prev.map(topic => topic.id === item.id ? data: topic))
            setSelTopic(current => current && current.id === item.id ? data : current)
            remainingAdds = remainingAdds.filter(topic => topic.id !== item.id)
          }
        }
        await nativeStorage.setItem("offlineAddQueue", JSON.stringify(remainingAdds))
      }
      const rawEdits = await nativeStorage.getItem("offlineEditQueue")
      const editQueue = JSON.parse(rawEdits || "[]")
      if (editQueue.length > 0) {
        console.log(`Processing ${editQueue.length} offline edits...`)
        let remainingEdits = [...editQueue]
        for (const item of editQueue) {
          const rawCurrentAdds = await nativeStorage.getItem("offlineAddQueue")
          const currentAdds = JSON.parse(rawCurrentAdds || "[]")
          if (currentAdds.some(topic => topic.id === item.id)) continue
          const { error } = await supabase
            .from("topics")
            .update( {content: item.content, title: item.title} )
            .eq("id", item.id)
          if (!error) {
            remainingEdits = remainingEdits.filter(topic => topic.id !== item.id)
          }
        }
        await nativeStorage.setItem("offlineEditQueue", JSON.stringify(remainingEdits))
      }
      const rawDeletes = await nativeStorage.getItem("offlineDeleteQueue")
      const deleteQueue = JSON.parse(rawDeletes || "[]")
      if (deleteQueue.length > 0) {
        console.log(`Processing ${deleteQueue.length} offline deletions...`);
        let remainingDeletes = [...deleteQueue]
        for (const topicId of deleteQueue) {
          if (typeof topicId === "string" && topicId.startsWith("local-")) {
            remainingDeletes = remainingDeletes.filter(id => id !== topicId)
            continue
          }
          const { error } = await supabase
            .from("topics")
            .delete()
            .eq("id", topicId)
          if (!error) {
            remainingDeletes = remainingDeletes.filter(id => id !== topicId)
          }
        }
        await nativeStorage.setItem("offlineDeleteQueue", JSON.stringify(remainingDeletes))
      }
    }
    processOfflineQueues()
    const networkListener = Network.addListener('networkStatusChange', (status) => {
      if (status.connected) {
        console.log("Native hardware reports online connection! Syncing queues...");
        processOfflineQueues();
      }
    })
    window.addEventListener("online", processOfflineQueues)
    return () => {
    window.removeEventListener("online", processOfflineQueues)
    networkListener.then(listener => listener.remove())
  }
  }, [user])
  
  //data downloader
  useEffect(() => {
    if (!user) {
    setTopics([])
    return
  }
  const fetchUserTopics = async () => {
    console.log("Fetching live notes for user: ", user.id)
    try {
      const cachedData = await nativeStorage.getItem(`cachedTopics${user.id}`)
      if (cachedData && typeof cachedData === 'string' && !cachedData.includes("object")) {
        setTopics(JSON.parse(cachedData))
      }
    } catch (e) {
      console.log("No valid cache found yet.")
    }
    const rawAdds = await nativeStorage.getItem("offlineAddQueue")
    const rawEdits = await nativeStorage.getItem("offlineEditQueue")
    const rawDeletes = await nativeStorage.getItem("offlineDeleteQueue")
    const hasUnsyncedData = 
      JSON.parse(rawAdds || "[]").length > 0 || 
      JSON.parse(rawEdits || "[]").length > 0 || 
      JSON.parse(rawDeletes || "[]").length > 0;
    if (hasUnsyncedData) {
      console.log("Unsynced queue items detected. Postponing cloud fetch to prevent data overwrites.")
      return; 
    }
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("user_id", user.id)
      if (error) {
        console.log("Error loading notes from Supabase: ", error.message)
      } else if (data) {
        console.log("Loaded topics from cloud: ", data)
        setTopics(data)
        await nativeStorage.setItem(`cachedTopics${user.id}`, JSON.stringify(data))
      }
    }
  }

  fetchUserTopics()
}, [user])
  //initialises state piece "query" to hold search input, and its function setQuery
  const [query, setQuery] = useState("");
  //takes a value as a parameter, and updates it
  const handleQueryChange = (value) => {
    setQuery(value);
  }
  //holds the selected topic object, initialised to null
  const [selTopic, setSelTopic] = useState(null)
  //filtered array containing matching items, strips each ##
  const filteredTopics = topics.filter(topic => {
    return topic.title.toLowerCase().includes(query.toLowerCase().trim());
  })
  //checks if atleast one match is found
  const doesQueryMatch = useMemo(() => {
    if (!query.trim()) {
      return false
    }
    //returns the topics that match
    return topics.some(topic => topic.title.toLowerCase().includes(query.toLowerCase()))
  }, [query, topics])
  const [editTitle, setEditTitle] = useState(selTopic?.title || "")
  useEffect(() => {
    setEditTitle(selTopic?.title || "")
  }, [selTopic?.title])
  const handleTitleBlur = () => {
    if (!selTopic) return
    if (editTitle.trim() !== '' && editTitle !== selTopic.title) {
      const isDuplicate = topics.some(
        topic => topic.title.toLowerCase() === editTitle.trim().toLowerCase() && topic.id !== selTopic.id
      )
      if (isDuplicate) {
        setEditTitle(selTopic.title)
        return
      }
      const updatedTopicObj = {
        ...selTopic,
        title: editTitle
      }
      setTopics(prevTopics => prevTopics.map(topic => topic.id === selTopic.id ? updatedTopicObj : topic))
      setSelTopic(updatedTopicObj)
      saveTopicChanges(updatedTopicObj)
    } else {
      setEditTitle(selTopic.title)
    }
  }
  //takes title as parameter, and adds it to the end of topics array
  const handleAddTopic = async (newTitle) => {
    if (!user) {
      alert("You must be logged in to save notes!")
      return
    }
    const newRow = {id: `local-${Date.now()}`, title: newTitle, content: "", user_id: user.id}
    setTopics(prevTopic => [...prevTopic, newRow])
    setQuery("")
    setSelTopic(newRow)

    const queueOfflineAddition = async () => {
      console.log("Adding topic:", newTitle)
      console.log("Online:", navigator.onLine)
      console.log("Queueing note addition locally due to a network connection loss...")
      const rawQueue = await nativeStorage.getItem("offlineAddQueue")
      const queue = JSON.parse(rawQueue || "[]")
      if (!queue.some(item => item.id === newRow.id)) {
        queue.push(newRow)
        await nativeStorage.setItem("offlineAddQueue", JSON.stringify(queue))
      }
    }

    if (!navigator.onLine) {
      queueOfflineAddition()
      return
    }
  try {
    const { data, error } = await supabase
      .from('topics')
      .insert([{ title: newTitle, content: "", user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    setTopics(prev =>
      prev.map(t => t.id === newRow.id ? data : t)
    )

    setSelTopic(data)

  } catch (err) {
    console.error("Network/cloud save failed:", err)

    queueOfflineAddition()
  }
  }
  const handleRemoveTopic = async () => {
    if (!selTopic || !selTopic.id) return
    const topicIdToDelete = selTopic.id
    setTopics(prevTopic => prevTopic.filter(topic => topic.id !== topicIdToDelete))
    setSelTopic(null)
    setQuery("")

    if (!navigator.onLine) {
      console.log("Offline. Queueing note deletion...")
      const rawAdds = await nativeStorage.getItem("offlineAddQueue")
      const addQueue = JSON.parse(rawAdds || "[]")
      if (addQueue.some(a => a.id === topicIdToDelete)) {
        await nativeStorage.setItem("offlineAddQueue", JSON.stringify(addQueue.filter(a => a.id !== topicIdToDelete)));
        return
      }
      const rawDeletes = await nativeStorage.getItem("offlineDeleteQueue")
      const deleteQueue = JSON.parse(rawDeletes || "[]");
      deleteQueue.push(topicIdToDelete);
      await nativeStorage.setItem("offlineDeleteQueue", JSON.stringify(deleteQueue));
      return
    }

    const {error} = await supabase
    .from("topics")
    .delete()
    .eq("id", selTopic.id)
    if (error) {
      console.log("Error deleting from Supabase: ", error.message)
      return
    }
  }
  //click event handler, sets selected topic, needs onClick attribute
  const handleTopicClick = (topic) => {
    console.log(`Topic clicked: ${topic.title}`);
    setSelTopic(topic)
  }
  //if selected topic exists, it passes the selected topic to a save function, and resets selected topic back to none
  const handleGoBack = () => {
    if (selTopic) {
      saveTopicChanges(selTopic) }
    setSelTopic(null)
    setQuery("")
  }
  //event object as parameter, updates selected topic by copying its old properties, but replaces content with the updated value
  const handleContentChange = (e) => {
    const updatedContent = e.target.value
    const updatedTopicObj = {
    ...selTopic,
    content: updatedContent
  };
  setSelTopic(updatedTopicObj)
  /* saveTopicChanges(updatedTopicObj); */
  };
  //takes topic object as parameter
  const saveTopicChanges = async (topicToSave) => {
    if (!topicToSave || !topicToSave.id) return
    //find the index of the topic being edited
    const index = topics.findIndex(topic => topic.id === topicToSave.id);
    let updatedTopics = [...topics]
    if (index !== -1) {
      updatedTopics[index] = topicToSave
      setTopics(updatedTopics)
    }
    try {
      await nativeStorage.setItem(`cachedTopics${user.id}`, JSON.stringify(updatedTopics))
    } catch (e) {
      console.error("Failed to update local topic cache:", e)
    }
    if (!navigator.onLine) {
      console.log("Offline. Queueing note changes...");
      const rawAdds = await nativeStorage.getItem("offlineAddQueue")
      const addQueue = JSON.parse(rawAdds || "[]");
      const addIndex = addQueue.findIndex(a => a.id === topicToSave.id);
      if (addIndex !== -1) {
        addQueue[addIndex] = topicToSave;
        await nativeStorage.setItem("offlineAddQueue", JSON.stringify(addQueue));
        return;
      }
      const rawEdits = await nativeStorage.getItem("offlineEditQueue")
      const editQueue = JSON.parse(rawEdits || "[]");
      const filteredQueue = editQueue.filter(item => item.id !== topicToSave.id);
      filteredQueue.push(topicToSave);
      await nativeStorage.setItem("offlineEditQueue", JSON.stringify(filteredQueue));
      return;
    }
    console.log(`Saving "${ topicToSave.title }" to the cloud...`)
    try {
    const { error } = await supabase
      .from("topics")
      .update({ content: topicToSave.content, title: topicToSave.title })
      .eq("id", topicToSave.id);

    if (error) {
      console.error("Cloud push failed, fallback routing active:", error.message);
    }
  } catch (err) {
    console.warn("Network timeout hit during typing event loop.", err);
  }
};
  //TROUBLESHOOTING
  //console.log(topics);
  //topics.forEach((t, i) => console.log(i, typeof t, t));


  //html functionality
  if (user) {
    return (
      <div className="App">
        <h1 className='txt' style={ { fontFamily:"GreatVibes", fontSize: "5rem", fontWeight: "bold", textAlign: "center" } }><b>Recall</b></h1>
        {success && <p className='txt' style={{ textAlign: "center", fontSize: "1rem" }} >{success}</p>}
        {selTopic ? (
          <div id="detailView">
            <div id="backHeader">
              <button id="backBtn" className="btn" onClick={handleGoBack}><svg width="24" height="24" viewBox="0 0 24 24" fill="#5C2526">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg></button>
              <input 
                  id="topicTitle"
                  className="input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} // Saves when pressing Enter
                  placeholder="Topic Title"
                  maxLength={25}
                />
              <button id="delBtn" className="btn" onClick={handleRemoveTopic}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
            <div id="contentBox">
              <textarea 
                  value={selTopic.content} 
                  onChange={handleContentChange}
                  placeholder="Start typing your notes here..."
                  // Styling to ensure the text area fits the contentBox design
                  style={{ 
                      width: '100%',
                      minHeight: '500px', 
                      border: 'none', 
                      padding: '0', 
                      margin: '0', 
                      resize: 'none', 
                      backgroundColor: 'inherit',
                      fontSize: "1rem",
                      fontFamily: 'inherit',
                      lineHeight: "1.5"
                  }}
                />
            </div>
          </div>
        ) : (
        <>
          <div id="main">
            <Bar query={query} onQueryChange={handleQueryChange} />
            <Button isActive={query.trim() !== "" && !doesQueryMatch} onAdd={() => handleAddTopic(query)} />
          </div>
          <div id="topicBox">
            <ul id="topicList">
              {filteredTopics.map((topic, index) => (
                <li className='topicItem' key={index} onClick={() => handleTopicClick(topic)}>{topic.title}</li>
              ))}
            </ul>
          </div>
        </>
        )}
      </div>
    );
    }
    return (
      <Login
        error={error}
        setError={setError}
        setSuccess={setSuccess}
        clearNotifications={clearNotifications}
        />
    )
}

export default App;
