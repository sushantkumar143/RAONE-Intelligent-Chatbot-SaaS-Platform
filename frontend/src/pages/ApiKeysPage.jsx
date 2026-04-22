import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Check, Shield } from 'lucide-react';
import { apiKeysAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadKeys(); }, []);

  const loadKeys = async () => {
    try {
      const res = await apiKeysAPI.list();
      setKeys(res.data);
    } catch (err) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return toast.error('Enter a key name');
    try {
      const res = await apiKeysAPI.create({ name: newKeyName });
      setCreatedKey(res.data);
      setNewKeyName('');
      setShowCreate(false);
      loadKeys();
      toast.success('API key created!');
    } catch (err) {
      toast.error('Failed to create key');
    }
  };

  const revokeKey = async (id) => {
    if (!confirm('Are you sure you want to revoke this key?')) return;
    try {
      await apiKeysAPI.revoke(id);
      loadKeys();
      toast.success('Key revoked');
    } catch (err) {
      toast.error('Failed to revoke key');
    }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-gray-400 mt-1">Manage API keys for your integrations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Generate Key
        </button>
      </div>

      {/* Created Key Display */}
      {createdKey && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6 border-amber-500/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 font-medium">Save your API key now — it won't be shown again!</p>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-dark-950 px-4 py-3 rounded-lg text-green-400 font-mono text-sm break-all">
              {createdKey.api_key}
            </code>
            <button onClick={() => copyKey(createdKey.api_key)} className="btn-secondary px-3 py-3">
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Create New API Key</h3>
          <div className="flex gap-3">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., Production, Testing)"
              className="input-field flex-1"
            />
            <button onClick={createKey} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No API keys yet</p>
            <p className="text-gray-500 text-sm mt-1">Generate your first key to start integrating</p>
          </div>
        ) : (
          keys.map((key, i) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${key.is_active ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                  <Key className={`w-5 h-5 ${key.is_active ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="text-white font-medium">{key.name}</p>
                  <p className="text-gray-500 text-sm font-mono">{key.key_prefix}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-3 py-1 rounded-full ${key.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {key.is_active ? 'Active' : 'Revoked'}
                </span>
                {key.is_active && (
                  <button onClick={() => revokeKey(key.id)} className="text-gray-500 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
