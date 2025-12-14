import logo from './logo.svg';
import './App.css';
import Button from "./components/Button"
import Bar from "./components/Bar"
import { useMemo, useState } from 'react';

function App() {
  //initialises state piece "query" to hold search input, and its function setQuery
  const [query, setQuery] = useState("");
  //updates query
  const handleQueryChange = (value) => {
    setQuery(value);
  }
  const [topics, setTopics] = useState([{ title: "Python", content: "Emp" }, { title: "Archery", content: "pt" }, { title: "Polynomials", content: "ty" }]);
  //holds the selected topic object
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
    return topics.some(topic => topic.title.toLowerCase().includes(query.toLowerCase()))
  }, [query, topics])
  //returns true if any array element satisfies the condition
  const handleAddTopic = (newTitle) => {
    const newTopicObj = {title: newTitle, content: ""}
    setTopics(prevTopic => [...prevTopic, newTopicObj]);
  }
  const handleTopicClick = (topic) => {
    console.log(`Topic clicked: ${topic.title}`);
    setSelTopic(topic)
  }
  const handleGoBack = () => {
    if (selTopic) {
      saveTopicChanges(selTopic)
    }
    setSelTopic(null)
  }
  const handleContentChange = (e) => {
    setSelTopic({
      ...selTopic, content: e.target.value,
    });
  };
  const saveTopicChanges = (topicToSave) => {
    // 1. Find the index of the topic being edited
    const index = topics.findIndex(topic => topic.title === topicToSave.title);
    
    // 2. Create a copy of the topics array
    const updatedTopics = [...topics];
    
    // 3. Replace the old topic object with the new, edited selTopic
    updatedTopics[index] = topicToSave;
    
    // 4. Update the main topics state
    setTopics(updatedTopics);
};
  //TROUBLESHOOTING
  //console.log(topics);
  //topics.forEach((t, i) => console.log(i, typeof t, t));


  //html functionality
  return (
    <div className="App">
      <h1 className='txt'>Recall</h1>
      {selTopic ? (
        <div id="detailView">
          <div id="backHeader">
            <button id="backBtn" className="btn" onClick={handleGoBack}>Back</button>
            <h2 id="topicTitle">{selTopic.title}</h2>
          </div>
          <div id="contentBox">
            <textarea 
                value={selTopic.content} 
                onChange={handleContentChange}
                placeholder="Start typing your notes here..."
                // Styling to ensure the textarea fits the contentBox design
                style={{ 
                    width: '100%', 
                    minHeight: '300px', 
                    border: 'none', 
                    padding: '0', 
                    margin: '0', 
                    resize: 'none', 
                    backgroundColor: 'inherit', /* Inherit the contentBox background */
                    fontFamily: 'inherit',
                }}
              />
          </div>
        </div>
      ) : (
      <>
        <div id="main">
          <Bar query={query} onQueryChange={handleQueryChange} />
          {query.trim() !== '' && (!doesQueryMatch ? (
            <Button onAdd={() => handleAddTopic(query)}/>
          ) : null)}
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

export default App;
