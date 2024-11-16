// src/components/TextEditor.js
import React, { useState } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';

function TextEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setPopupPosition({ top: rect.top + window.scrollY, left: rect.left });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  return (
    <div>
      {/* Simple toolbar for formatting */}
      <div className="toolbar" style={{ marginBottom: '10px' }}>
        <button onMouseDown={(e) => { e.preventDefault(); toggleBlockType('header-one'); }}>H1</button>
        <button onMouseDown={(e) => { e.preventDefault(); toggleInlineStyle('BOLD'); }}>Bold</button>
        <button onMouseDown={(e) => { e.preventDefault(); toggleBlockType('unordered-list-item'); }}>Bullet</button>
        {/* Add more buttons as needed */}
      </div>

      {/* Editor container */}
      <div onMouseUp={handleMouseUp} style={{ border: '1px solid #ccc', padding: '10px', minHeight: '300px' }}>
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={(command) => {
            const newState = RichUtils.handleKeyCommand(editorState, command);
            if (newState) {
              setEditorState(newState);
              return 'handled';
            }
            return 'not-handled';
          }}
        />
      </div>

      {/* Pop-up for custom interactions */}
      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: popupPosition.top + 20,
            left: popupPosition.left,
            backgroundColor: 'lightgrey',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          <textarea placeholder="Add your notes or call an API here..." />
          <button onClick={() => alert('API called!')}>Call API</button>
        </div>
      )}
    </div>
  );
}

export default TextEditor;
