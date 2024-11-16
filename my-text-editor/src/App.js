import React, { useState } from 'react';
import TextEditor from './components/TextEditor';
import Sidebar from './components/Sidebar';

function App() {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const folderStructure = [
    {
      name: 'Folder 1',
      documents: ['Document 1', 'Document 2'],
    },
    {
      name: 'Folder 2',
      documents: ['Document 3', 'Document 4'],
    },
    {
      name: 'Folder 3',
      documents: ['Document 5'],
    },
  ];

  const handleSelectDocument = (doc) => {
    alert(`Selected: ${doc}`);
    setSelectedDocument(doc);
  };

  return (
    <div style={styles.container}>
      <Sidebar folderStructure={folderStructure} onSelectDocument={handleSelectDocument} />
      <div style={styles.editorContainer}>
        <h1>Versare</h1>
        <TextEditor selectedDocument={selectedDocument} />
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