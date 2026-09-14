import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  ChevronRight,
  Folder,
  Tag,
  CornerDownRight,
} from 'lucide-react';
import { Category } from '../types';

interface CategoriesViewProps {
  categoryTree: Category[];
  onOpenAddModal: () => void;
  onDeleteCategory: (id: number) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categoryTree,
  onOpenAddModal,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const filteredTree = categoryTree.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Category Hierarchy</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize transactions into parent categories and subcategories (Student 1 Architecture)
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'EXPENSE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Expense Categories
        </button>
        <button
          onClick={() => setActiveTab('INCOME')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'INCOME'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Income Categories
        </button>
      </div>

      {/* Category Tree Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTree.map((parent) => (
          <div
            key={parent.id}
            className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3"
          >
            {/* Parent Category Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: parent.color || '#6366F1' }}
                />
                <span className="font-bold text-sm text-white">{parent.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-medium">
                  Parent
                </span>
              </div>

              <button
                onClick={() => {
                  if (
                    confirm(
                      `Delete parent category "${parent.name}"? Subcategories will also be deleted.`
                    )
                  ) {
                    onDeleteCategory(parent.id);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Delete Parent Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subcategories */}
            <div className="space-y-1.5 pl-2">
              {parent.children && parent.children.length > 0 ? (
                parent.children.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <CornerDownRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 font-medium">{sub.name}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete subcategory "${sub.name}"?`)) {
                          onDeleteCategory(sub.id);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Subcategory"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic pl-4 py-1">
                  No subcategories created under this parent yet.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
