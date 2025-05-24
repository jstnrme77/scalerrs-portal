/**
 * Centralized filter state management utilities
 * 
 * Provides state persistence, restoration, filter history,
 * undo/redo functionality, and filter presets/saved searches.
 */

import { FilterState, FilterPreset, FilterHistoryEntry } from '@/types/filters';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Filter state manager configuration
 */
export interface FilterStateConfig {
  /** Storage key prefix for localStorage */
  storagePrefix: string;
  
  /** Maximum number of history entries to keep */
  maxHistorySize: number;
  
  /** Whether to persist state in localStorage */
  persistState: boolean;
  
  /** Whether to enable undo/redo functionality */
  enableHistory: boolean;
  
  /** Default filter state */
  defaultState: FilterState;
}

/**
 * Filter state manager interface
 */
export interface FilterStateManager {
  // Current state
  getCurrentState(): FilterState;
  setState(state: FilterState): void;
  updateState(updates: Partial<FilterState>): void;
  resetState(): void;
  
  // Persistence
  saveState(key?: string): void;
  loadState(key?: string): FilterState | null;
  deleteState(key?: string): void;
  listSavedStates(): string[];
  
  // History and undo/redo
  getHistory(): FilterHistoryEntry[];
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): FilterState | null;
  redo(): FilterState | null;
  clearHistory(): void;
  
  // Presets
  savePreset(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset;
  loadPreset(id: string): FilterState | null;
  deletePreset(id: string): boolean;
  listPresets(): FilterPreset[];
  updatePreset(id: string, updates: Partial<FilterPreset>): FilterPreset | null;
  
  // Utilities
  exportState(): string;
  importState(data: string): boolean;
  getStateSize(): number;
  cleanup(): void;
}

// ============================================================================
// FILTER STATE MANAGER IMPLEMENTATION
// ============================================================================

/**
 * Centralized filter state manager
 */
export class FilterStateManagerImpl implements FilterStateManager {
  private currentState: FilterState;
  private history: FilterHistoryEntry[] = [];
  private historyIndex = -1;
  private presets: FilterPreset[] = [];

  constructor(private config: FilterStateConfig) {
    this.currentState = { ...config.defaultState };
    this.loadFromStorage();
  }

  // ============================================================================
  // CURRENT STATE MANAGEMENT
  // ============================================================================

  getCurrentState(): FilterState {
    return { ...this.currentState };
  }

  setState(state: FilterState): void {
    const previousState = { ...this.currentState };
    this.currentState = { ...state };
    
    if (this.config.enableHistory) {
      this.addToHistory(previousState, state, 'setState');
    }
    
    if (this.config.persistState) {
      this.saveToStorage();
    }
  }

  updateState(updates: Partial<FilterState>): void {
    const previousState = { ...this.currentState };
    this.currentState = { ...this.currentState, ...updates };
    
    if (this.config.enableHistory) {
      this.addToHistory(previousState, this.currentState, 'updateState');
    }
    
    if (this.config.persistState) {
      this.saveToStorage();
    }
  }

  resetState(): void {
    const previousState = { ...this.currentState };
    this.currentState = { ...this.config.defaultState };
    
    if (this.config.enableHistory) {
      this.addToHistory(previousState, this.currentState, 'resetState');
    }
    
    if (this.config.persistState) {
      this.saveToStorage();
    }
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  saveState(key?: string): void {
    if (!this.config.persistState) return;
    
    const storageKey = key || `${this.config.storagePrefix}_current`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.currentState));
    } catch (error) {
      console.warn('Failed to save filter state to localStorage:', error);
    }
  }

  loadState(key?: string): FilterState | null {
    if (!this.config.persistState) return null;
    
    const storageKey = key || `${this.config.storagePrefix}_current`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load filter state from localStorage:', error);
    }
    return null;
  }

  deleteState(key?: string): void {
    if (!this.config.persistState) return;
    
    const storageKey = key || `${this.config.storagePrefix}_current`;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to delete filter state from localStorage:', error);
    }
  }

  listSavedStates(): string[] {
    if (!this.config.persistState) return [];
    
    const keys: string[] = [];
    const prefix = this.config.storagePrefix;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix) && !key.includes('_presets') && !key.includes('_history')) {
          keys.push(key.replace(prefix + '_', ''));
        }
      }
    } catch (error) {
      console.warn('Failed to list saved states:', error);
    }
    
    return keys;
  }

  // ============================================================================
  // HISTORY AND UNDO/REDO
  // ============================================================================

  getHistory(): FilterHistoryEntry[] {
    return [...this.history];
  }

  canUndo(): boolean {
    return this.config.enableHistory && this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.config.enableHistory && this.historyIndex < this.history.length - 1;
  }

  undo(): FilterState | null {
    if (!this.canUndo()) return null;
    
    this.historyIndex--;
    const entry = this.history[this.historyIndex];
    this.currentState = { ...entry.previousState };
    
    if (this.config.persistState) {
      this.saveToStorage();
    }
    
    return this.getCurrentState();
  }

  redo(): FilterState | null {
    if (!this.canRedo()) return null;
    
    this.historyIndex++;
    const entry = this.history[this.historyIndex];
    this.currentState = { ...entry.newState };
    
    if (this.config.persistState) {
      this.saveToStorage();
    }
    
    return this.getCurrentState();
  }

  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
    
    if (this.config.persistState) {
      this.saveHistoryToStorage();
    }
  }

  // ============================================================================
  // PRESETS
  // ============================================================================

  savePreset(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset {
    const newPreset: FilterPreset = {
      ...preset,
      id: this.generatePresetId(),
      createdAt: new Date()
    };
    
    this.presets.push(newPreset);
    
    if (this.config.persistState) {
      this.savePresetsToStorage();
    }
    
    return newPreset;
  }

  loadPreset(id: string): FilterState | null {
    const preset = this.presets.find(p => p.id === id);
    if (preset) {
      this.setState(preset.filters);
      return this.getCurrentState();
    }
    return null;
  }

  deletePreset(id: string): boolean {
    const index = this.presets.findIndex(p => p.id === id);
    if (index >= 0) {
      this.presets.splice(index, 1);
      
      if (this.config.persistState) {
        this.savePresetsToStorage();
      }
      
      return true;
    }
    return false;
  }

  listPresets(): FilterPreset[] {
    return [...this.presets];
  }

  updatePreset(id: string, updates: Partial<FilterPreset>): FilterPreset | null {
    const preset = this.presets.find(p => p.id === id);
    if (preset) {
      Object.assign(preset, updates);
      
      if (this.config.persistState) {
        this.savePresetsToStorage();
      }
      
      return { ...preset };
    }
    return null;
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  exportState(): string {
    const exportData = {
      currentState: this.currentState,
      history: this.history,
      presets: this.presets,
      config: this.config,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  importState(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      
      if (importData.currentState) {
        this.currentState = importData.currentState;
      }
      
      if (importData.history && Array.isArray(importData.history)) {
        this.history = importData.history;
        this.historyIndex = this.history.length - 1;
      }
      
      if (importData.presets && Array.isArray(importData.presets)) {
        this.presets = importData.presets;
      }
      
      if (this.config.persistState) {
        this.saveToStorage();
        this.saveHistoryToStorage();
        this.savePresetsToStorage();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import filter state:', error);
      return false;
    }
  }

  getStateSize(): number {
    const data = {
      currentState: this.currentState,
      history: this.history,
      presets: this.presets
    };
    
    return JSON.stringify(data).length;
  }

  cleanup(): void {
    // Clean up old history entries if we exceed max size
    if (this.history.length > this.config.maxHistorySize) {
      const excess = this.history.length - this.config.maxHistorySize;
      this.history.splice(0, excess);
      this.historyIndex = Math.max(0, this.historyIndex - excess);
    }
    
    // Clean up old localStorage entries
    if (this.config.persistState) {
      this.cleanupStorage();
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private addToHistory(
    previousState: FilterState,
    newState: FilterState,
    action: string
  ): void {
    // Remove any entries after current index (for redo functionality)
    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }
    
    const entry: FilterHistoryEntry = {
      id: this.generateHistoryId(),
      previousState,
      newState,
      action,
      timestamp: new Date()
    };
    
    this.history.push(entry);
    this.historyIndex = this.history.length - 1;
    
    // Clean up if we exceed max size
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
    
    if (this.config.persistState) {
      this.saveHistoryToStorage();
    }
  }

  private loadFromStorage(): void {
    if (!this.config.persistState) return;
    
    // Load current state
    const savedState = this.loadState();
    if (savedState) {
      this.currentState = savedState;
    }
    
    // Load history
    this.loadHistoryFromStorage();
    
    // Load presets
    this.loadPresetsFromStorage();
  }

  private saveToStorage(): void {
    this.saveState();
  }

  private saveHistoryToStorage(): void {
    if (!this.config.persistState) return;
    
    try {
      const historyData = {
        history: this.history,
        historyIndex: this.historyIndex
      };
      localStorage.setItem(
        `${this.config.storagePrefix}_history`,
        JSON.stringify(historyData)
      );
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  }

  private loadHistoryFromStorage(): void {
    if (!this.config.persistState) return;
    
    try {
      const saved = localStorage.getItem(`${this.config.storagePrefix}_history`);
      if (saved) {
        const historyData = JSON.parse(saved);
        this.history = historyData.history || [];
        this.historyIndex = historyData.historyIndex || -1;
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error);
    }
  }

  private savePresetsToStorage(): void {
    if (!this.config.persistState) return;
    
    try {
      localStorage.setItem(
        `${this.config.storagePrefix}_presets`,
        JSON.stringify(this.presets)
      );
    } catch (error) {
      console.warn('Failed to save presets to localStorage:', error);
    }
  }

  private loadPresetsFromStorage(): void {
    if (!this.config.persistState) return;
    
    try {
      const saved = localStorage.getItem(`${this.config.storagePrefix}_presets`);
      if (saved) {
        this.presets = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load presets from localStorage:', error);
    }
  }

  private cleanupStorage(): void {
    // This could be expanded to clean up old or unused entries
    // For now, just ensure we don't exceed reasonable storage limits
    const currentSize = this.getStateSize();
    const maxSize = 1024 * 1024; // 1MB limit
    
    if (currentSize > maxSize) {
      // Reduce history size
      const targetHistorySize = Math.floor(this.config.maxHistorySize / 2);
      if (this.history.length > targetHistorySize) {
        const excess = this.history.length - targetHistorySize;
        this.history.splice(0, excess);
        this.historyIndex = Math.max(0, this.historyIndex - excess);
        this.saveHistoryToStorage();
      }
    }
  }

  private generatePresetId(): string {
    return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a filter state manager with default configuration
 */
export function createFilterStateManager(
  config: Partial<FilterStateConfig> = {}
): FilterStateManager {
  const defaultConfig: FilterStateConfig = {
    storagePrefix: 'filter_state',
    maxHistorySize: 50,
    persistState: true,
    enableHistory: true,
    defaultState: {}
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  return new FilterStateManagerImpl(finalConfig);
}

/**
 * Create a filter state manager for a specific entity type
 */
export function createEntityFilterStateManager(
  entityType: string,
  defaultState: FilterState,
  config: Partial<FilterStateConfig> = {}
): FilterStateManager {
  return createFilterStateManager({
    storagePrefix: `filter_state_${entityType}`,
    defaultState,
    ...config
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Compare two filter states for equality
 */
export function compareFilterStates(state1: FilterState, state2: FilterState): boolean {
  return JSON.stringify(state1) === JSON.stringify(state2);
}

/**
 * Get a summary of active filters in a state
 */
export function getFilterStateSummary(state: FilterState): {
  totalFilters: number;
  activeFilters: string[];
  isEmpty: boolean;
} {
  const activeFilters: string[] = [];
  
  if (state.textSearch?.query) {
    activeFilters.push('text search');
  }
  
  if (state.status?.statuses?.length) {
    activeFilters.push('status');
  }
  
  if (state.category?.categories?.length) {
    activeFilters.push('category');
  }
  
  if (state.client?.clientIds?.length) {
    activeFilters.push('client');
  }
  
  if (state.priority?.priorities?.length) {
    activeFilters.push('priority');
  }
  
  if (state.dateRanges && Object.keys(state.dateRanges).length > 0) {
    activeFilters.push('date ranges');
  }
  
  if (state.users && Object.keys(state.users).length > 0) {
    activeFilters.push('user assignments');
  }
  
  if (state.numericRanges && Object.keys(state.numericRanges).length > 0) {
    activeFilters.push('numeric ranges');
  }
  
  if (state.customFilters && Object.keys(state.customFilters).length > 0) {
    activeFilters.push('custom filters');
  }
  
  return {
    totalFilters: activeFilters.length,
    activeFilters,
    isEmpty: activeFilters.length === 0
  };
}

/**
 * Merge multiple filter states with conflict resolution
 */
export function mergeFilterStates(
  ...states: FilterState[]
): FilterState {
  const merged: FilterState = {};
  
  for (const state of states) {
    Object.assign(merged, state);
  }
  
  return merged;
}