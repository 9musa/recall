function Bar({ query, onQueryChange }) {
    const handleChange = (event) => {
        onQueryChange(event.target.value);
    }
    return <input
                type="text"
                id="Bar"
                value={query}
                placeholder="Search your notes..."
                onChange={handleChange}
            />
}

export default Bar;