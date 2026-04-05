/**
 * @file history-coordinator.ts
 * @description Handles grouping actions and history manager extensions for the UI.
 */

import { HistoryManager, historyManager as coreHM, g } from '@hcie/core';

class GroupAction {
    constructor(public description: string, public actions: any[]) {}
    undo() { 
        for (let i = this.actions.length - 1; i >= 0; i--) {
            this.actions[i].undo();
        }
    }
    redo() { 
        for (let i = 0; i < this.actions.length; i++) {
            this.actions[i].redo();
        }
    }
}

/**
 * Extends a HistoryManager instance with grouping capabilities.
 */
export function extendHistoryManager(hm: any) {
    if (hm._grouped) return;
    hm._grouped = true;
    hm._groupStack = [];
    hm._currentGroup = null;

    const originalPush = hm.push;
    hm.push = function(action: any) {
        if (this._currentGroup) {
            this._currentGroup.actions.push(action);
        } else {
            originalPush.call(this, action);
            if ((window as any).updateUndoRedoUI) (window as any).updateUndoRedoUI();
        }
    };

    hm.beginGroup = function(description = 'Çoklu İşlem') {
        const group = { description, actions: [] };
        this._groupStack.push(group);
        this._currentGroup = group;
    };

    hm.endGroup = function() {
        if (this._groupStack.length === 0) return;
        const group = this._groupStack.pop();
        this._currentGroup = this._groupStack.length > 0 ? this._groupStack[this._groupStack.length - 1] : null;
        
        if (group && group.actions.length > 0) {
            if (group.actions.length === 1) {
                this.push(group.actions[0]);
            } else {
                originalPush.call(this, new GroupAction(group.description, group.actions));
            }
        }
        if ((window as any).updateUndoRedoUI) (window as any).updateUndoRedoUI();
    };
}

const docHistories = new Map<string, HistoryManager>();

/**
 * Gets or creates a HistoryManager for a specific document.
 */
export function getHistoryForDoc(docId: string): HistoryManager {
    if (!docHistories.has(docId)) {
        const hm = new HistoryManager(g.max_undo_steps || 200);
        extendHistoryManager(hm);
        docHistories.set(docId, hm);
    }
    return docHistories.get(docId)!;
}
