// Activity-related handler functions for Designer component

/**
 * Handles saving flashcards editor data
 * @param {Object} savedData - The saved flashcards data
 * @param {Object} editingFlashcardsBlock - The block being edited
 * @param {Function} setBlocks - React state setter for blocks
 * @param {Function} setEditingFlashcardsBlock - React state setter for editing block
 * @param {Function} logDesignerJson - Utility function to log designer state
 */
export const handleFlashcardsSave = (
  savedData,
  editingFlashcardsBlock,
  setBlocks,
  setEditingFlashcardsBlock,
  logDesignerJson
) => {
  if (editingFlashcardsBlock) {
    // Update the block in blocks state with new props
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === editingFlashcardsBlock.id) {
          return {
            ...block,
            props: {
              data: savedData
            }
          };
        }
        return block;
      });
      
      // Output updated Designer JSON to console
      logDesignerJson();
      
      return updatedBlocks;
    });
  }
  
  setEditingFlashcardsBlock(null);
};

/**
 * Handles cancelling the flashcards editor
 * @param {Function} setEditingFlashcardsBlock - React state setter for editing block
 */
export const handleFlashcardsCancel = (setEditingFlashcardsBlock) => {
  setEditingFlashcardsBlock(null);
};

/**
 * Handles saving quiz editor data
 * @param {Object} savedData - The saved quiz data
 * @param {Object} editingQuizBlock - The block being edited
 * @param {Function} setBlocks - React state setter for blocks
 * @param {Function} setEditingQuizBlock - React state setter for editing block
 * @param {Function} logDesignerJson - Utility function to log designer state
 */
export const handleQuizSave = (
  savedData,
  editingQuizBlock,
  setBlocks,
  setEditingQuizBlock,
  logDesignerJson
) => {
  if (editingQuizBlock) {
    // Update the block in blocks state with new props
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === editingQuizBlock.id) {
          return {
            ...block,
            props: {
              data: savedData
            }
          };
        }
        return block;
      });
      
      // Output updated Designer JSON to console
      logDesignerJson();
      
      return updatedBlocks;
    });
  }
  
  setEditingQuizBlock(null);
};

/**
 * Handles cancelling the quiz editor
 * @param {Function} setEditingQuizBlock - React state setter for editing block
 */
export const handleQuizCancel = (setEditingQuizBlock) => {
  setEditingQuizBlock(null);
};

/**
 * Handles saving dropdown editor data
 * @param {Object} savedData - The saved dropdown data
 * @param {Object} editingDropdownBlock - The block being edited
 * @param {Function} setBlocks - React state setter for blocks
 * @param {Function} setEditingDropdownBlock - React state setter for editing block
 * @param {Function} logDesignerJson - Utility function to log designer state
 */
export const handleDropdownSave = (
  savedData,
  editingDropdownBlock,
  setBlocks,
  setEditingDropdownBlock,
  logDesignerJson
) => {
  if (editingDropdownBlock) {
    // Update the block in blocks state with new props
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === editingDropdownBlock.id) {
          return {
            ...block,
            props: {
              data: savedData
            }
          };
        }
        return block;
      });
      
      // Output updated Designer JSON to console
      logDesignerJson();
      
      return updatedBlocks;
    });
  }
  
  setEditingDropdownBlock(null);
};

/**
 * Handles cancelling the dropdown editor
 * @param {Function} setEditingDropdownBlock - React state setter for editing block
 */
export const handleDropdownCancel = (setEditingDropdownBlock) => {
  setEditingDropdownBlock(null);
};

/**
 * Handles saving fill-in-the-blanks editor data
 * @param {Object} savedData - The saved fill-in-the-blanks data
 * @param {Object} editingFillInTheBlanksBlock - The block being edited
 * @param {Function} setBlocks - React state setter for blocks
 * @param {Function} setEditingFillInTheBlanksBlock - React state setter for editing block
 * @param {Function} logDesignerJson - Utility function to log designer state
 */
export const handleFillInTheBlanksSave = (
  savedData,
  editingFillInTheBlanksBlock,
  setBlocks,
  setEditingFillInTheBlanksBlock,
  logDesignerJson
) => {
  if (editingFillInTheBlanksBlock) {
    // Update the block in blocks state with new props
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === editingFillInTheBlanksBlock.id) {
          return {
            ...block,
            props: {
              data: savedData
            }
          };
        }
        return block;
      });
      
      // Output updated Designer JSON to console
      logDesignerJson();
      
      return updatedBlocks;
    });
  }
  
  setEditingFillInTheBlanksBlock(null);
};

/**
 * Handles cancelling the fill-in-the-blanks editor
 * @param {Function} setEditingFillInTheBlanksBlock - React state setter for editing block
 */
export const handleFillInTheBlanksCancel = (setEditingFillInTheBlanksBlock) => {
  setEditingFillInTheBlanksBlock(null);
};

/**
 * Handles saving memory game editor data
 * @param {Object} savedData - The saved memory game data
 * @param {Object} editingMemoryGameBlock - The block being edited
 * @param {Function} setBlocks - React state setter for blocks
 * @param {Function} setEditingMemoryGameBlock - React state setter for editing block
 * @param {Function} logDesignerJson - Utility function to log designer state
 */
export const handleMemoryGameSave = (
  savedData,
  editingMemoryGameBlock,
  setBlocks,
  setEditingMemoryGameBlock,
  logDesignerJson
) => {
  if (editingMemoryGameBlock) {
    // Update the block in blocks state with new props
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === editingMemoryGameBlock.id) {
          return {
            ...block,
            props: {
              data: savedData
            }
          };
        }
        return block;
      });
      
      // Output updated Designer JSON to console
      logDesignerJson();
      
      return updatedBlocks;
    });
  }
  
  setEditingMemoryGameBlock(null);
};

/**
 * Handles cancelling the memory game editor
 * @param {Function} setEditingMemoryGameBlock - React state setter for editing block
 */
export const handleMemoryGameCancel = (setEditingMemoryGameBlock) => {
  setEditingMemoryGameBlock(null);
};

/**
 * Handles saving table editor data
 * @param {Object} savedData - The saved table data
 * @param {Object} editingTableBlock - The block being edited
 * @param {Function} setBlocks - React state setter for blocks
 * @param {Function} setEditingTableBlock - React state setter for editing block
 * @param {Function} logDesignerJson - Utility function to log designer state
 */
export const handleTableSave = (
  savedData,
  editingTableBlock,
  setBlocks,
  setEditingTableBlock,
  logDesignerJson
) => {
  if (editingTableBlock) {
    // Update the block in blocks state with new props
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === editingTableBlock.id) {
          return {
            ...block,
            props: {
              data: savedData
            }
          };
        }
        return block;
      });
      
      // Output updated Designer JSON to console
      logDesignerJson();
      
      return updatedBlocks;
    });
  }
  
  setEditingTableBlock(null);
};

/**
 * Handles cancelling the table editor
 * @param {Function} setEditingTableBlock - React state setter for editing block
 */
export const handleTableCancel = (setEditingTableBlock) => {
  setEditingTableBlock(null);
};

/**
 * Handles saving dialog editor data
 * @param {Object} savedData - The saved dialog data
 * @param {Object} editingDialogBlock - The block being edited
 * @param {Function} setBlocks - React state setter for blocks
 * @param {Function} setEditingDialogBlock - React state setter for editing block
 * @param {Function} logDesignerJson - Utility function to log designer state
 */
export const handleDialogSave = (
  savedData,
  editingDialogBlock,
  setBlocks,
  setEditingDialogBlock,
  logDesignerJson
) => {
  if (editingDialogBlock) {
    // Update the block in blocks state with new props
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === editingDialogBlock.id) {
          return {
            ...block,
            props: {
              data: savedData
            }
          };
        }
        return block;
      });
      
      // Output updated Designer JSON to console
      logDesignerJson();
      
      return updatedBlocks;
    });
  }
  
  setEditingDialogBlock(null);
};

/**
 * Handles cancelling the dialog editor
 * @param {Function} setEditingDialogBlock - React state setter for editing block
 */
export const handleDialogCancel = (setEditingDialogBlock) => {
  setEditingDialogBlock(null);
};
