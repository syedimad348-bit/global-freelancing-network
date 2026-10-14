import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Bot,
  Layers,
  Cpu,
  Image,
  Palette,
  Type,
  Flame,
  Video,
  Film,
  Camera,
  Mic,
  Music,
  Layout,
  Terminal,
  Code,
  Workflow,
  Zap,
} from 'lucide-react';
import { TRICKS_CATALOGUE, TRICK_CATEGORIES } from '../../lib/tricksData';
import WhatsAppRequestModal from '../../components/WhatsAppRequestModal';

const ICON_MAP = {
  Bot,
  Sparkles,
  Layers,
  Search,
  Cpu,
  Image,
  Palette,
  Type,
  Flame,
  Video,
  Film,
  Camera,
  Mic,
  Music,
  Layout,
  Figma: Layout,
  Terminal,
  Code,
  Workflow,
  Zap,
};

export default function Tricks() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TRICKS_CATALOGUE.filter((tool) => {
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      const matchesSearch =
        q === '' ||
        tool.name.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleOpenTrickModal = (tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-7 sm:p-9 shadow-elevated overflow-hidden border border-emerald-50/20">
        <div className="absolute right-0 top-0 -bottom-10 w-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-brand-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            Curated Collection · 20 Elite AI Tools
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Tricks & High-Impact Productivity Suite
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            Gain an unfair advantage in international freelancing. Discover verified tools, access proprietary prompt workflows, and request access resources delivered via WhatsApp.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name, capability, or keyword…"
              className="input pl-10 h-11 text-sm bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-subtle hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-ink-muted">
            Showing <span className="font-bold text-ink">{filteredTools.length}</span> of {TRICKS_CATALOGUE.length} tools
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TRICK_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150',
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white text-ink-muted border border-line hover:text-ink hover:bg-surface-subtle',
                ].join(' ')}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 20 Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-ink-muted flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink">No tools found matching your search</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            Try adjusting your search keywords or switch to "All" categories to view the full catalogue.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="btn-secondary h-9 px-4 text-xs font-semibold mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool, index) => {
            const IconComponent = ICON_MAP[tool.icon] || Sparkles;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="card flex flex-col justify-between group hover:border-brand-300 hover:shadow-cardHover transition-all"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Icon, Name, Category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-ink truncate group-hover:text-brand-600 transition-colors">
                          {tool.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-block">
                          {tool.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                    {tool.desc}
                  </p>

                  {/* Tags & Pricing */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-line/60 text-[11px]">
                    <span className="font-semibold text-ink-soft bg-surface-subtle px-2 py-0.5 rounded border border-line">
                      {tool.pricing}
                    </span>
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                      title={`Visit official ${tool.name} website`}
                    >
                      Official Site
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Prominent "Get Trick" Action */}
                <div className="pt-4 mt-3 border-t border-line/60">
                  <button
                    onClick={() => handleOpenTrickModal(tool)}
                    className="w-full h-10 rounded-xl bg-sidebar text-white hover:bg-brand-600 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Get Trick</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Access Request Modal */}
      <WhatsAppRequestModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTool(null);
        }}
      />
    </div>
  );
}
