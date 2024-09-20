import React, { useState } from 'react';
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Plus, Search, Moon, Sun } from 'lucide-react';
import { Modal, Button, Alert } from '@/components/ui/alert';

const generateHeatmapData = (days) => {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(2024, 0, i + 1),
    intensity: Math.random(),
    events: []
  }));
};

const generateAnalyticsData = () => ({
  taskCompletion: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, rate: Math.random() * 100 })),
  categoryBreakdown: [
    { name: 'Work', value: 40 },
    { name: 'Fitness', value: 30 },
    { name: 'Personal', value: 30 }
  ],
  productivityTrend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, productivity: 50 + Math.random() * 50 }))
});

const WebPlannerHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState(generateHeatmapData(365));
  const [analyticsData] = useState(generateAnalyticsData());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getColor = (intensity) => {
    const hue = 200; // Blue hue
    const saturation = 80;
    const lightness = 100 - (intensity * 50); // Lighter colors for less busy days
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    if (newEvent.trim() !== '') {
      const updatedData = heatmapData.map(day => 
        day.date.getTime() === selectedDay.date.getTime() 
          ? { ...day, events: [...day.events, newEvent], intensity: Math.min(1, day.intensity + 0.2) }
          : day
      );
      setHeatmapData(updatedData);
      setNewEvent('');
      setIsModalOpen(false);
    }
  };

  const filteredData = heatmapData.filter(day => 
    day.events.some(event => event.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`flex flex-col w-full min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Web Planner Heatmap</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              className="pl-8 pr-2 py-1 rounded border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
      </div>
      
      {/* Heatmap */}
      <div className="overflow-x-auto mb-8">
        <div className="flex" style={{ width: `${heatmapData.length * 20}px` }}>
          {heatmapData.map((day, index) => (
            <div
              key={index}
              className="w-5 h-5 mr-1 cursor-pointer transition-transform hover:scale-110"
              style={{ backgroundColor: getColor(day.intensity) }}
              title={`${day.date.toDateString()} (${day.events.length} events)`}
              onClick={() => handleDayClick(day)}
            />
          ))}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Task Completion Rate */}
        <div className={`p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-lg font-semibold mb-2">Task Completion Rate</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analyticsData.taskCompletion}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className={`p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-lg font-semibold mb-2">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analyticsData.categoryBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity Trend */}
        <div className={`p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-lg font-semibold mb-2">Productivity Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analyticsData.productivityTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="productivity" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && selectedDay && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedDay.date.toDateString()}
        >
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Events:</h3>
            {selectedDay.events.length > 0 ? (
              <ul className="list-disc pl-5">
                {selectedDay.events.map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            ) : (
              <p>No events for this day.</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              placeholder="Add new event"
              className="flex-grow mr-2 p-2 border rounded"
            />
            <Button onClick={handleAddEvent}>
              <Plus size={20} />
            </Button>
          </div>
        </Modal>
      )}

      {/* Search Results */}
      {searchTerm && (
        <div className={`mt-4 p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-lg font-semibold mb-2">Search Results</h2>
          {filteredData.length > 0 ? (
            <ul className="list-disc pl-5">
              {filteredData.map((day, index) => (
                <li key={index} className="mb-2">
                  <strong>{day.date.toDateString()}:</strong>
                  <ul className="list-circle pl-5">
                    {day.events.filter(event => event.toLowerCase().includes(searchTerm.toLowerCase())).map((event, eventIndex) => (
                      <li key={eventIndex}>{event}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>No events found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WebPlannerHeatmap;
