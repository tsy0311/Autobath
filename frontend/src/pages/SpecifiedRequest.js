import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function SpecifiedRequest() {
  const [selectedAreas, setSelectedAreas] = useState(new Set());
  const [viewerMode, setViewerMode] = useState('2d'); // '2d' | 'unity'
  const [unityReady, setUnityReady] = useState(false);
  const unityIframeRef = useRef(null);

  // Listen for messages from Unity WebGL (optional UNITY_READY signal)
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event || !event.data) return;
      if (event.data.type === 'UNITY_READY') {
        setUnityReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getUnityInstance = () => {
    const iframeWindow = unityIframeRef.current?.contentWindow;
    if (!iframeWindow) return undefined;
    // Unity loader usually assigns unityInstance on the window of the iframe
    return iframeWindow.unityInstance;
  };

  const sendMessageToUnity = (gameObject, method, param) => {
    const instance = getUnityInstance();
    if (instance && typeof instance.SendMessage === 'function') {
      try {
        instance.SendMessage(gameObject, method, param ?? '');
        return true;
      } catch (err) {
        // swallow
      }
    }
    return false;
  };

  const selectModelInUnity = (modelId) => {
    const ok = sendMessageToUnity('CarShowroomManager', 'SelectModel', modelId);
    if (!ok) {
      // fallback UX hint
      alert('Unity is not ready yet. Please wait for the viewer to load.');
    }
  };

  const toggleAreaInUnity = (area) => {
    const ok = sendMessageToUnity('CarShowroomManager', 'ToggleArea', area);
    if (!ok) {
      alert('Unity is not ready yet. Please wait for the viewer to load.');
    }
  };

  const toggleArea = (area) => {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  };

  const selectedAreasList = useMemo(() => Array.from(selectedAreas), [selectedAreas]);
  const bookingLink = useMemo(() => {
    const params = new URLSearchParams({ type: 'specified' });
    if (selectedAreasList.length > 0) {
      params.set('areas', selectedAreasList.join(','));
    }
    return `/booking?${params.toString()}`;
  }, [selectedAreasList]);

  return (
    <div className="min-h-screen bg-white">
      <section className="container py-8 md:py-10">
        <div className="section-title mb-6">
          <h2>{'Specify Focus Areas'}</h2>
          <p>{'Choose the parts of your car you want us to focus on. Use the 3D viewer (Unity/WebGL) if available, or the 2D selector.'}</p>
        </div>

        {/* Viewer mode toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setViewerMode('2d')}
            className={`px-4 py-2 rounded-lg border ${viewerMode === '2d' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'}`}
          >
            {'2D Selector'}
          </button>
          <button
            type="button"
            onClick={() => setViewerMode('unity')}
            className={`px-4 py-2 rounded-lg border ${viewerMode === 'unity' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'}`}
          >
            {'3D (Unity/WebGL)'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Viewer */}
          <div className="lg:col-span-2">
            {viewerMode === 'unity' ? (
              <div className="w-full aspect-video rounded-2xl border-2 border-secondary/20 bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-xl">
                  <div className="text-3xl mb-3">🚗</div>
                  <h3 className="text-xl font-bold mb-2 text-primary">{'Unity/WebGL Viewer Placeholder'}</h3>
                  <p className="text-gray-600 mb-3">
                    {'Build your Unity WebGL project and place it under public/unity/index.html, then it will load here.'}
                  </p>
                  <div className="text-sm font-mono bg-white border rounded px-3 py-2 inline-block">{'/public/unity/index.html'}</div>
                  <div className="mt-4">
                    <iframe
                      ref={unityIframeRef}
                      title="Unity Viewer"
                      src={'/unity/index.html'}
                      className="w-full h-80 rounded border"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    {unityReady ? 'Viewer connected' : 'Waiting for Unity to be ready...'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full rounded-2xl border-2 border-secondary/20 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{'2D Car Selector'}</h3>
                {/* Simple 2D representation with clickable tags */}
                <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] bg-white rounded-xl border overflow-hidden">
                  {/* Car silhouette (simplified) */}
                  <svg viewBox="0 0 800 450" className="w-full h-full">
                    <g fill="#eef2ff" stroke="#94a3b8" strokeWidth="3">
                      <rect x="120" y="180" width="560" height="120" rx="20" />
                      <rect x="200" y="140" width="360" height="80" rx="20" />
                      <circle cx="230" cy="310" r="40" fill="#e2e8f0" />
                      <circle cx="570" cy="310" r="40" fill="#e2e8f0" />
                    </g>
                  </svg>

                  {/* Click targets */}
                  <button
                    type="button"
                    onClick={() => toggleArea('exterior')}
                    className={`absolute left-6 top-6 px-3 py-1 rounded-full text-sm border ${selectedAreas.has('exterior') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'}`}
                  >
                    {'Exterior'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleArea('interior')}
                    className={`absolute right-6 top-6 px-3 py-1 rounded-full text-sm border ${selectedAreas.has('interior') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'}`}
                  >
                    {'Interior'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleArea('front')}
                    className={`absolute left-6 bottom-6 px-3 py-1 rounded-full text-sm border ${selectedAreas.has('front') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'}`}
                  >
                    {'Front'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleArea('rear')}
                    className={`absolute right-6 bottom-6 px-3 py-1 rounded-full text-sm border ${selectedAreas.has('rear') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'}`}
                  >
                    {'Rear'}
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedAreasList.length === 0 ? (
                    <span className="text-sm text-gray-500">{'No areas selected yet'}</span>
                  ) : (
                    selectedAreasList.map((area) => (
                      <span key={area} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm border border-secondary/20">
                        {area}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-secondary/20 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-primary mb-3">{'Your Selection'}</h3>
              {selectedAreasList.length === 0 ? (
                <p className="text-sm text-gray-600 mb-4">{'Select areas from the viewer to focus your cleaning.'}</p>
              ) : (
                <ul className="mb-4 list-disc list-inside text-gray-700">
                  {selectedAreasList.map((area) => (
                    <li key={area} className="capitalize">{area}</li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-3">
                <Link to={bookingLink} className="btn btn-primary w-full text-center">
                  {'Proceed to Booking'}
                </Link>
                {selectedAreasList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedAreas(new Set())}
                    className="btn w-auto"
                  >
                    {'Clear'}
                  </button>
                )}
              </div>

              {viewerMode === 'unity' && (
                <div className="mt-6">
                  <h4 className="font-semibold text-primary mb-2">{'Unity Controls'}</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button type="button" className="btn" onClick={() => selectModelInUnity('sedan')}>{'Sedan'}</button>
                    <button type="button" className="btn" onClick={() => selectModelInUnity('suv')}>{'SUV'}</button>
                    <button type="button" className="btn" onClick={() => selectModelInUnity('coupe')}>{'Coupe'}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn" onClick={() => toggleAreaInUnity('frontLeftDoor')}>{'Front-Left Door'}</button>
                    <button type="button" className="btn" onClick={() => toggleAreaInUnity('frontRightDoor')}>{'Front-Right Door'}</button>
                    <button type="button" className="btn" onClick={() => toggleAreaInUnity('rearLeftDoor')}>{'Rear-Left Door'}</button>
                    <button type="button" className="btn" onClick={() => toggleAreaInUnity('rearRightDoor')}>{'Rear-Right Door'}</button>
                    <button type="button" className="btn" onClick={() => toggleAreaInUnity('boot')}>{'Boot'}</button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default SpecifiedRequest;


