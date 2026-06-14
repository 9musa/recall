//import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Button from "./components/Button";
import Bar from "./components/Bar";
import { useMemo, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
  //data downloader
  useEffect(() => {
    if (!user) {
    setTopics([])
    return
  }
  const fetchUserTopics = async () => {
    console.log("Fetching live notes for user: ", user.id)
    const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", user.id)
    if (error) {
      console.log("Error loading notes from Supabase: ", error.message)
    } else if (data) {
      console.log("Loaded topics from cloud: ", data)
      setTopics(data)
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
    const newRow = {title: newTitle, content: "", user_id: user.id}
    const { data, error } = await supabase
    .from('topics')
    .insert([newRow])
    .select()
    .single()
    if (error) {
      console.error("Error saving note to cloud: ", error.message)
      alert("Failed to save note.")
    } else {
    setTopics(prevTopic => [...prevTopic, data]);
    setQuery("")
    setSelTopic(data)
    }
  }
  const handleRemoveTopic = async () => {
    if (!selTopic || !selTopic.id) return
    const {error} = await supabase
    .from("topics")
    .delete()
    .eq("id", selTopic.id)
    if (error) {
      console.log("Error deleting from Supabase: ", error.message)
      return
    }
    setTopics(prevTopic => prevTopic.filter(topic => topic.title !== selTopic.title))
    setSelTopic(null)
    setQuery("")
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
    setSelTopic({
      ...selTopic, content: e.target.value,
    });
  };
  //takes topic object as parameter
  const saveTopicChanges = async (topicToSave) => {
    if (!topicToSave || !topicToSave.id) return
    //find the index of the topic being edited
    const index = topics.findIndex(topic => topic.id === topicToSave.id);
    if (index !== -1) {
      const updatedTopics = [...topics]
      updatedTopics[index] = topicToSave
      setTopics(updatedTopics)
    }
    console.log(`Saving "${ topicToSave.title }" to the cloud...`)
    const { error } = await supabase
    .from("topics")
    .update({
      content: topicToSave.content,
      title: topicToSave.title
    })
    .eq("id", topicToSave.id)
    if (error) {
      console.error("Error backing up to Supabase: ", error.message)
    } else {
      console.log("Changes successfully backed up to Supabase!")
    }
}
  //TROUBLESHOOTING
  //console.log(topics);
  //topics.forEach((t, i) => console.log(i, typeof t, t));


  //html functionality
  if (user) {
    return (
      <div className="App">
        <h1 className='txt' style={ { fontFamily:"GreatVibes", fontSize: "5rem", fontWeight: "bold", textAlign: "center" } }><b>Recall</b></h1>
        {success && <p className='txt' style={ {fontSize:"0.75rem"}, {textAlign:"center"}, {fontSize:"1rem"} }>{success}</p>}
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
