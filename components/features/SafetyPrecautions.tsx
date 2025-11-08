import React from 'react';

interface SafetyPrecautionsProps {
  userId: string;
  precautions: Array<{
    id: string;
    recommendation: string;
    priority: string;
    category: string;
    createdAt: string;
  }>;
}

const SafetyPrecautions: React.FC<SafetyPrecautionsProps> = ({ userId, precautions }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      default:
        return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'diet':
        return '🥗';
      case 'activity':
        return '🏃';
      case 'medication':
        return '💊';
      case 'lifestyle':
        return '🌟';
      default:
        return '📌';
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1) + ' Priority';
  };

  if (precautions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚕️</div>
        <div className="text-xl text-purple-300 mb-2">No safety precautions yet</div>
        <div className="text-gray-400">Upload medical reports to receive personalized safety recommendations</div>
      </div>
    );
  }

  // Group by priority
  const highPriority = precautions.filter(p => p.priority === 'high');
  const mediumPriority = precautions.filter(p => p.priority === 'medium');
  const lowPriority = precautions.filter(p => p.priority === 'low');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Safety Precautions & Recommendations</h3>
        <p className="text-purple-300">Personalized health guidance based on your medical records</p>
      </div>

      {highPriority.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-red-300 flex items-center gap-2">
            <span>🚨</span>
            High Priority ({highPriority.length})
          </h4>
          {highPriority.map((precaution) => (
            <div
              key={precaution.id}
              className={`p-4 rounded-lg border ${getPriorityColor(precaution.priority)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getCategoryIcon(precaution.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/30">
                      {precaution.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-red-500/20">
                      {getPriorityLabel(precaution.priority)}
                    </span>
                  </div>
                  <p className="text-white leading-relaxed">{precaution.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mediumPriority.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
            <span>⚠️</span>
            Medium Priority ({mediumPriority.length})
          </h4>
          {mediumPriority.map((precaution) => (
            <div
              key={precaution.id}
              className={`p-4 rounded-lg border ${getPriorityColor(precaution.priority)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getCategoryIcon(precaution.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/30">
                      {precaution.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-500/20">
                      {getPriorityLabel(precaution.priority)}
                    </span>
                  </div>
                  <p className="text-white leading-relaxed">{precaution.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lowPriority.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
            <span>ℹ️</span>
            General Recommendations ({lowPriority.length})
          </h4>
          {lowPriority.map((precaution) => (
            <div
              key={precaution.id}
              className={`p-4 rounded-lg border ${getPriorityColor(precaution.priority)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getCategoryIcon(precaution.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/30">
                      {precaution.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white leading-relaxed">{precaution.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SafetyPrecautions;
