import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

const SearchForm = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Set equal to result from face-api
  const handleInputChange = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchTerm.trim() !== '') {
      setErrorMsg('');
      props.handleSearch(searchTerm);
    } else {
      setErrorMsg('Please enter a search term.');
    }
  };

  return (
    <div>
      <Form onSubmit={handleSearch}>
        {errorMsg && <p className="errorMsg">{errorMsg}</p>}
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Once your mood is displayed in box below, select search or press enter to see your results!</Form.Label>
          <Form.Control
            type="search"
            name="searchTerm"
            value={searchTerm}
            onChange={handleInputChange}
            autoComplete="off"
          />
        </Form.Group>
        <button type="submit">
          Search
        </button>
      </Form>
    </div>
  );
};

export default SearchForm;
