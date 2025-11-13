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
  const handleAddTopic = (newTopic) => {
    setTopics(prevTopic => [...prevTopic, newTopic]);
  }
  const handleTopicClick = (topic) => {
    console.log(`Topic clicked: ${topic.title}`);
    setSelTopic(topics)
  }
  //TROUBLESHOOTING
  console.log(topics);
  topics.forEach((t, i) => console.log(i, typeof t, t));
  return (
    <div className="App">
      <h1 className='txt'>Recall</h1>
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
    </div>
  );
}

export default App;
