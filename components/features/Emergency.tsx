import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface EmergencyProps {
  user: User;
}

interface EmergencyContact {
  name: string;
  number: string;
  type: 'ambulance' | 'police' | 'fire' | 'hospital' | 'hotline';
  description: string;
}

const Emergency: React.FC<EmergencyProps> = ({ user }) => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isPanicActive, setIsPanicActive] = useState(false);

  const emergencyContacts: EmergencyContact[] = [
    {
      name: '911 Emergency',
      number: '911',
      type: 'ambulance',
      description: 'Immediate medical, fire, or police emergency'
    },
    {
      name: 'Ambulance Service',
      number: '911',
      type: 'ambulance',
      description: 'Medical emergencies and ambulance dispatch'
    },
    {
      name: 'Poison Control',
      number: '1-800-222-1222',
      type: 'hospital',
      description: '24/7 poison control and medical guidance'
    },
    {
      name: 'Mental Health Crisis',
      number: '988',
      type: 'hotline',
      description: 'Suicide & crisis lifeline - 24/7 support'
    },
    {
      name: 'Non-Emergency Medical',
      number: '311',
      type: 'hospital',
      description: 'Non-urgent medical questions and referrals'
    },
  ];

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to access location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handlePanicButton = () => {
    setIsPanicActive(true);
    setTimeout(() => setIsPanicActive(false), 5000);
  };

  const makeCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return '🚑';
      case 'police':
        return '👮';
      case 'fire':
        return '🚒';
      case 'hospital':
        return '🏥';
      case 'hotline':
        return '📞';
      default:
        return '⚠️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ambulance':
        return 'from-red-500/20 to-pink-500/20 border-red-500/40';
      case 'police':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      case 'fire':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/40';
      case 'hospital':
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40';
      case 'hotline':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/40';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 gradient-text" style={{
          background: 'linear-gradient(135deg, #ff3366 0%, #ff6b9d 50%, #00ff88 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🚨 EMERGENCY SERVICES
        </h1>
        <p className="text-gray-400 text-lg">Immediate access to emergency contacts and help</p>
      </div>

      <div className="glass-card p-8 border-2 border-red-500/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🆘</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">PANIC BUTTON</h2>
            <p className="text-gray-300 mb-6">Click to call 911 immediately</p>
          </div>
          <button
            onMouseDown={handlePanicButton}
            onTouchStart={handlePanicButton}
            className={`w-full py-8 rounded-2xl font-bold text-2xl transition-all duration-300 ${
              isPanicActive
                ? 'bg-gradient-to-r from-red-600 to-pink-600 scale-95 shadow-2xl shadow-red-500/50'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:scale-105'
            } text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/30`}
            onClick={() => {
              if (window.confirm('⚠️ EMERGENCY ALERT\n\nAre you sure you want to call 911?')) {
                makeCall('911');
              }
            }}
          >
            {isPanicActive ? '🚨 CALLING 911...' : '🆘 EMERGENCY - CALL 911'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyContacts.map((contact, index) => (
          <div
            key={index}
            className={`glass-card p-6 border-2 bg-gradient-to-br ${getTypeColor(contact.type)} hover:scale-105 transition-all duration-300 cursor-pointer group`}
            onClick={() => makeCall(contact.number)}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {getTypeIcon(contact.type)}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{contact.name}</h3>
            <p className="text-3xl font-bold mb-3 gradient-text" style={{
              background: 'linear-gradient(135deg, #00ff88, #00d9ff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {contact.number}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">{contact.description}</p>
            <div className="mt-4 py-2 px-4 rounded-full bg-white/10 text-emerald-400 text-center font-semibold group-hover:bg-emerald-500/20 transition-all duration-300">
              Tap to Call
            </div>
          </div>
        ))}
      </div>

      {location && (
        <div className="glass-card p-6 border border-emerald-500/30">
          <h3 className="text-2xl font-bold mb-4 gradient-text" style={{
            background: 'linear-gradient(135deg, #00ff88, #00d9ff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📍 Your Location
          </h3>
          <div className="space-y-3">
            <p className="text-gray-300">
              <span className="font-semibold text-emerald-400">Coordinates:</span>{' '}
              {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
            </p>
            <a
              href={`https://www.google.com/maps/search/hospital+near+me/@${location.lat},${location.lon},15z`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-center hover:from-emerald-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
            >
              🏥 Find Nearest Hospitals
            </a>
            <a
              href={`https://www.google.com/maps/search/emergency+room+near+me/@${location.lat},${location.lon},15z`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-center hover:from-cyan-600 hover:to-blue-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30"
            >
              🚑 Find Nearest Emergency Rooms
            </a>
          </div>
        </div>
      )}

      {locationError && (
        <div className="glass-card p-6 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-400 mb-1">Location Access Required</h3>
              <p className="text-gray-300 text-sm">{locationError}</p>
              <p className="text-gray-400 text-sm mt-2">
                Enable location services to find nearby emergency services automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 border border-purple-500/30">
        <h3 className="text-2xl font-bold mb-4 gradient-text" style={{
          background: 'linear-gradient(135deg, #ff3366, #ff6b9d)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          💡 Emergency Tips
        </h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Stay Calm:</span> Take deep breaths and speak clearly when calling emergency services.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Provide Location:</span> Share your exact location and any landmarks.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Medical Info:</span> Have your medical conditions and medications ready to share.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Stay on the Line:</span> Don't hang up until instructed by the operator.
            </div>
          </li>
        </ul>
      </div>

      <div className="glass-card p-6 border border-emerald-500/30 text-center">
        <p className="text-gray-400 text-sm">
          <span className="text-emerald-400 font-semibold">Hello {user.name}!</span> In case of emergency, use these resources immediately. Your safety is our top priority. 💚
        </p>
      </div>
    </div>
  );
};

export default Emergency;
