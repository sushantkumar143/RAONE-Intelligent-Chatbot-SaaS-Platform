import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Globe, FileText, Trash2, CheckCircle, Clock, AlertCircle, Plus, Database } from 'lucide-react';
import { knowledgeAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function KnowledgeBasePage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const stages = [
    "Parsing content...",
    "Chunking text into semantic blocks...",
    "Generating dense vector embeddings...",
    "Storing vectors in knowledge base..."
  ];

  useEffect(() => { loadSources(); }, []);

  // Update loading stage periodically while uploading
  useEffect(() => {
    let interval;
    if (uploading) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 1500); // Progress stage every 1.5s
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [uploading]);


  const loadSources = async () => {
    try {
      const res = await knowledgeAPI.list();
      setSources(res.data.sources || res.data || []);
    } catch (err) {
      console.error('Failed to load sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await knowledgeAPI.upload(formData);
      }
      toast.success('Files uploaded successfully');
      loadSources();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlScrape = async () => {
    if (!urlInput.trim()) return toast.error('Enter a URL');
    setUploading(true);
    try {
      await knowledgeAPI.scrapeUrl({ url: urlInput });
      toast.success('URL scraped successfully');
      setUrlInput('');
      loadSources();
    } catch (err) {
      toast.error('Scraping failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textTitle.trim() || !textContent.trim()) return toast.error('Fill in all fields');
    setUploading(true);
    try {
      await knowledgeAPI.addText({ title: textTitle, content: textContent });
      toast.success('Text added successfully');
      setTextTitle('');
      setTextContent('');
      loadSources();
    } catch (err) {
      toast.error('Failed to add text');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this source?')) return;
    try {
      await knowledgeAPI.delete(id);
      toast.success('Source deleted');
      loadSources();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing': return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const tabs = [
    { id: 'upload', label: 'File Upload', icon: Upload },
    { id: 'url', label: 'Website URL', icon: Globe },
    { id: 'text', label: 'Manual Text', icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-gray-400 mt-1">Train your chatbot with your data</p>
      </div>

      {/* Ingestion Tabs */}
      <div className="glass-card p-6 mb-8">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-primary-500/30 rounded-xl bg-primary-500/5">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-accent-500/40 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-4 border-4 border-primary-400 rounded-full animate-spin border-l-transparent direction-reverse"></div>
              <Database className="absolute inset-0 m-auto w-6 h-6 text-primary-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Adding to Knowledge Base</h3>
            
            <div className="w-full max-w-sm bg-black/40 rounded-full h-2 mb-4 overflow-hidden border border-white/10">
              <motion.div 
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((loadingStage + 1) / stages.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <div className="h-8 relative w-full overflow-hidden flex justify-center items-center">
                <motion.p 
                  key={loadingStage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-primary-300 font-medium absolute text-center"
                >
                  {stages[loadingStage]}
                </motion.p>
            </div>
            
            <p className="text-gray-500 text-xs mt-4">Depending on the size, this could take a few moments...</p>
          </div>
        ) : (
          <>
            {/* File Upload */}
            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary-500/30 transition-all">
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drag & drop files here, or click to browse</p>
                <p className="text-gray-500 text-sm mb-4">Supports PDF, DOCX, TXT (max 10MB)</p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">
                  Choose Files
                </label>
              </div>
            )}

            {/* URL Scrape */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/docs"
                    className="input-field flex-1"
                  />
                  <button onClick={handleUrlScrape} className="btn-primary">
                    Scrape URL
                  </button>
                </div>
              </div>
            )}

            {/* Manual Text */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <input
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Title (e.g., FAQ, Return Policy)"
                  className="input-field"
                />
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter your content here..."
                  rows={6}
                  className="input-field resize-none"
                />
                <button onClick={handleTextSubmit} className="btn-primary">
                  Add Content
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sources List */}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Sources ({sources.length})
        </h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No knowledge sources yet</p>
              <p className="text-gray-500 text-sm mt-1">Upload files or add content to train your chatbot</p>
            </div>
          ) : (
            sources.map((source, i) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {statusIcon(source.status)}
                  <div>
                    <p className="text-white font-medium text-sm">{source.name}</p>
                    <p className="text-gray-500 text-xs">
                      {source.source_type} · {source.chunk_count} chunks
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(source.id)} className="text-gray-500 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

