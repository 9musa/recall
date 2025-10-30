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
  const topics = ["Python", "Archery", "Polynomials"];
  //filtered array containing matching items, strips each ##
  const filteredTopics = topics.filter(topic => {
    return topic.toLowerCase().includes(query.toLowerCase().trim());
  })
  //checks if atleast one match is found
  const doesQueryMatch = useMemo(() => {
    if (!query.trim()) {
      return false
    }
    return topics.some(topic => topic.toLowerCase().includes(query.toLowerCase()))
  }, [query, topics])
  return (
    <div className="App">
      <h1 className='txt'>Recall</h1>
      <div id="main">
        <Bar query={query} onQueryChange={handleQueryChange} />
        {query.trim() !== '' && (!doesQueryMatch ? (
          <Button />
        ) : null)}
      </div>
      <div id="topicBox">
        <ul id="topicList">
          {filteredTopics.map((topic, index) => (
            <li className='topicItem' key={index}>{topic}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
