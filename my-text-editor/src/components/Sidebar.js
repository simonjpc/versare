import React, { useEffect, useState } from 'react';
import axios from '../config/axios';

const Sidebar = ({ onSelectDocument }) => {
  const [folderStructure, setFolderStructure] = useState([]);

  useEffect(() => {
    axios.get('/files')
      .then(response => {
        console.log('Response data:', response.data); // Log the data
        setFolderStructure(response.data);
      })
      .catch(err => console.error('Error fetching files:', err));
  }, []);
  

  return (
    <div style={styles.sidebar}>
      {folderStructure.map((folder, index) => (
        <div key={index} style={styles.folder}>
          <div style={styles.folderName}>{folder.name}</div>
          {folder.documents.map((doc, i) => (
            <div
              key={i}
              style={styles.document}
              onClick={() => onSelectDocument(`${folder.name}/${doc}`)}
            >
              {doc}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#f4f4f4',
    padding: '10px',
    borderRight: '1px solid #ccc',
    height: '100vh',
    overflowY: 'auto',
  },
  folder: {
    marginBottom: '10px',
  },
  folderName: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  document: {
    cursor: 'pointer',
    padding: '5px',
    paddingLeft: '15px',
  },
};

export default Sidebar;
