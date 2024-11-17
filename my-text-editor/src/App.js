import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TextEditor from './components/TextEditor';

function App() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');

  const handleSelectDocument = (docPath) => {
    axios.get(`/file?path=${encodeURIComponent(docPath)}`)
      .then(response => {
        setSelectedDocument(docPath);
        setDocumentContent(response.data.content || ''); // Set content to an empty string if not available
      })
      .catch(err => console.error('Error fetching file:', err));
  };

  const handleSaveDocument = () => {
    axios.post('/file', {
      path: selectedDocument,
      content: documentContent,
    }).then(() => alert('File saved successfully'))
      .catch(err => console.error('Error saving file:', err));
  };

  return (
    <div style={styles.container}>
      <Sidebar onSelectDocument={handleSelectDocument} />
      <div style={styles.editorContainer}>
        <h1>Versare</h1>
        <TextEditor
          content={documentContent}
          onChange={(newContent) => setDocumentContent(newContent)}
        />
        <button onClick={handleSaveDocument} disabled={!selectedDocument}>
          Save
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  editorContainer: {
    flex: 1,
    padding: '20px',
  },
};

export default App;
