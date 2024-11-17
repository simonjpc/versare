// src/components/TextEditor.js
import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw, SelectionState, CompositeDecorator } from 'draft-js';
import 'draft-js/dist/Draft.css';
import axios from 'axios';

const highlightStrategy = (contentBlock, callback, contentState) => {
  const text = contentBlock.getText();
  const textToHighlight = "Les dispositions du présent Cahier des clauses administratives particulières (CCAP) sont d'application stricte et ne peuvent faire l'objet d'aucune dérogation. Toute modification ou adaptation des termes du présent CCAP est interdite, à peine de nullité des modifications proposées, sauf mention expresse contraire et dûment justifiée dans un avenant signé par les parties prenantes.";
  const index = text.indexOf(textToHighlight);
  if (index >= 0) {
    callback(index, index + textToHighlight.length);
  }
};

const HighlightSpan = (props) => {
  return (
    <span style={{ backgroundColor: 'yellow' }}>
      {props.children}
    </span>
  );
};

const decorator = new CompositeDecorator([
  {
    strategy: highlightStrategy,
    component: HighlightSpan,
  },
]);

function TextEditor({ content, onChange }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty(decorator));
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [popupText, setPopupText] = useState('');
  const [highlightedText, setHighlightedText] = useState(''); // State to store highlighted text

  useEffect(() => {
    if (content) {
      try {
        const parsedContent = convertFromRaw(JSON.parse(content));
        const newEditorState = EditorState.createWithContent(parsedContent, decorator);
        setEditorState(moveCursorToEnd(newEditorState));
      } catch (e) {
        const newEditorState = EditorState.createWithContent(ContentState.createFromText(content), decorator);
        setEditorState(moveCursorToEnd(newEditorState));
      }
    }
  }, [content]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    // Optionally, debounce this function if saving to the parent:
    if (onChange) {
        setTimeout(() => {
            const rawContent = JSON.stringify(convertToRaw(state.getCurrentContent()));
            onChange(rawContent);
        }, 2); // Adjust delay as needed
    }
};

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setPopupPosition({ top: rect.top + window.scrollY, left: rect.left });
      setHighlightedText(selection.toString()); // Store the highlighted text
      setShowPopup(true);
    } else {
      setShowPopup(false);
      setHighlightedText(''); // Reset highlighted text when pop-up is closed
    }
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const moveCursorToEnd = (editorState) => {
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const key = blockMap.last().getKey();
    const length = blockMap.last().getLength();
    const selection = SelectionState.createEmpty(key).merge({
      anchorKey: key,
      anchorOffset: length,
      focusKey: key,
      focusOffset: length,
    });
    return EditorState.forceSelection(editorState, selection);
  };

  const handleApiCall = async () => {
    try {
      const response = await axios.post('/api/call', {
        text: popupText,
        highlightedText: highlightedText // Include the highlighted text in the request
      });
      const newContentState = replaceSelectedText(editorState, response.data.content);
      setEditorState(EditorState.push(editorState, newContentState, 'insert-characters'));
      setPopupText(''); // Clear the popup text after API call
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const replaceSelectedText = (editorState, newText) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    const block = contentState.getBlockForKey(startKey);
    const blockText = block.getText();
    const newBlockText = blockText.slice(0, startOffset) + newText + blockText.slice(endOffset);
    const newBlock = block.merge({ text: newBlockText });
    const newContentState = contentState.merge({
      blockMap: contentState.getBlockMap().set(startKey, newBlock),
      selectionBefore: selection,
      selectionAfter: selection.merge({
        anchorOffset: startOffset + newText.length,
        focusOffset: startOffset + newText.length,
      }),
    });
    return newContentState;
  };

  const handleKeyCommand = (command) => {
    if (command === 'undo') {
      setEditorState(EditorState.undo(editorState));
      return 'handled';
    }
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
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
          handleKeyCommand={handleKeyCommand}
        />
      </div>

      {/* Pop-up for custom interactions */}
      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: popupPosition.top + 20,
            left: popupPosition.left + 100,
            backgroundColor: 'lightgrey',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 1000,
            minWidth: '300px',
            minHeight: '100px'
          }}
        >
          <textarea
            placeholder="What would you like to do?..."
            style={{
              width: '100%',
              height: '120px',
              marginBottom: '10px'
            }}
            value={popupText}
            onChange={(e) => setPopupText(e.target.value)}
          />
          <button onClick={handleApiCall}>Call API</button>
        </div>
      )}
    </div>
  );
}

export default TextEditor;
