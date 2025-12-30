import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card, Button, TextInput, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDatabase } from '../hooks/useDatabase';
import { format, parseISO, differenceInMinutes, differenceInHours } from 'date-fns';

const TimeTracking = ({ projectId }) => {
const { executeQuery, executeNonQuery } = useDatabase();
const [workers, setWorkers] = useState([]);
const [activeTimers, setActiveTimers] = useState({});
const [todayRecords, setTodayRecords] = useState([]);
const [filter, setFilter] = useState('today'); // today, week, all
const [selectedWorker, setSelectedWorker] = useState(null);
const [workType, setWorkType] = useState('regular'); // regular, overtime, weekend

useEffect(() => {
loadWorkers();
loadTodayRecords();
loadActiveTimers();
}, [projectId]);

const loadWorkers = async () => {
const result = await executeQuery(
SELECT w.*, t.name as trade_name, t.hourly_rate FROM workers w LEFT JOIN trades t ON w.trade_id = t.id WHERE w.project_id = ? AND w.active = 1 ORDER BY w.name,
[projectId]
);
setWorkers(result);
};

const loadTodayRecords = async () => {
const today = format(new Date(), 'yyyy-MM-dd');
const result = await executeQuery(
SELECT t.*, w.name as worker_name, w.trade_name FROM time_records t LEFT JOIN workers w ON t.worker_id = w.id WHERE t.project_id = ? AND DATE(t.start_time) = ? ORDER BY t.start_time DESC,
[projectId, today]
);
setTodayRecords(result);
};

const loadActiveTimers = async () => {
const result = await executeQuery(
"SELECT worker_id FROM time_records WHERE project_id = ? AND end_time IS NULL",
[projectId]
);
const timers = {};
result.forEach(record => {
timers[record.worker_id] = true;
});
setActiveTimers(timers);
};

const startTimer = async (workerId) => {
try {
// Check if already has active timer
if (activeTimers[workerId]) {
Alert.alert("Error", "Worker already has an active timer");
return;
}

text
  await executeNonQuery(
    `INSERT INTO time_records (project_id, worker_id, start_time, work_type, date) 
     VALUES (?, ?, ?, ?, ?)`,
    [projectId, workerId, new Date().toISOString(), workType, format(new Date(), 'yyyy-MM-dd')]
  );

  setActiveTimers({ ...activeTimers, [workerId]: true });
  loadTodayRecords();
} catch (error) {
  console.error('Error starting timer:', error);
  Alert.alert("Error", "Failed to start timer");
}
};

const stopTimer = async (workerId) => {
try {
// Get the active record
const records = await executeQuery(
"SELECT id FROM time_records WHERE worker_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1",
[workerId]
);

text
  if (records.length === 0) {
    Alert.alert("Error", "No active timer found for this worker");
    return;
  }

  const recordId = records[0].id;
  await executeNonQuery(
    "UPDATE time_records SET end_time = ? WHERE id = ?",
    [new Date().toISOString(), recordId]
  );

  const newTimers = { ...activeTimers };
  delete newTimers[workerId];
  setActiveTimers(newTimers);
  loadTodayRecords();
} catch (error) {
  console.error('Error stopping timer:', error);
  Alert.alert("Error", "Failed to stop timer");
}
};

const calculateDuration = (startTime, endTime = new Date()) => {
const start = parseISO(startTime);
const end = endTime ? parseISO(endTime) : new Date();
const minutes = differenceInMinutes(end, start);
const hours = Math.floor(minutes / 60);
const mins = minutes % 60;
return { hours, minutes: mins, totalMinutes: minutes };
};

const calculateTotalHours = (records) => {
return records.reduce((total, record) => {
const duration = calculateDuration(record.start_time, record.end_time);
return total + duration.totalMinutes;
}, 0) / 60;
};

const renderWorkerCard = (worker) => {
const isActive = activeTimers[worker.id];
const todayHours = todayRecords
.filter(record => record.worker_id === worker.id && record.end_time)
.reduce((total, record) => {
const duration = calculateDuration(record.start_time, record.end_time);
return total + duration.totalMinutes;
}, 0) / 60;

text
return (
  <Card key={worker.id} style={styles.workerCard}>
    <Card.Content>
      <View style={styles.workerHeader}>
        <View style={styles.workerAvatar}>
          <Icon name="account-hard-hat" size={24} color="#fff" />
        </View>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker.name}</Text>
          <Text style={styles.workerTrade}>{worker.trade_name}</Text>
        </View>
        <View style={styles.workerStats}>
          <Text style={styles.hoursText}>{todayHours.toFixed(1)}</Text>
          <Text style={styles.hoursLabel}>hours today</Text>
        </View>
      </View>
      
      <View style={styles.timerContainer}>
        {isActive ? (
          <View style={styles.activeTimer}>
            <View style={styles.timerRunning}>
              <Icon name="clock-outline" size={20} color="#4CAF50" />
              <Text style={styles.timerText}>Timer Running</Text>
            </View>
            <Button 
              mode="contained" 
              onPress={() => stopTimer(worker.id)}
              style={styles.stopButton}
            >
              Stop
            </Button>
          </View>
        ) : (
          <Button 
            mode="contained" 
            onPress={() => startTimer(worker.id)}
            style={styles.startButton}
          >
            <Icon name="play" size={16} color="#fff" />
            <Text style={styles.startButtonText}>Start Work</Text>
          </Button>
        )}
      </View>
      
      <View style={styles.workTypeSelector}>
        <Text style={styles.workTypeLabel}>Work Type:</Text>
        <View style={styles.workTypeButtons}>
          {['regular', 'overtime', 'weekend'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.workTypeButton, workType === type && styles.workTypeButtonSelected]}
              onPress={() => setWorkType(type)}
            >
              <Text style={[styles.workTypeButtonText, workType === type && styles.workTypeButtonTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Card.Content>
  </Card>
);
};

const renderTimeRecord = (record) => {
const duration = calculateDuration(record.start_time, record.end_time || new Date());
const start = parseISO(record.start_time);
const end = record.end_time ? parseISO(record.end_time) : null;

text
return (
  <View key={record.id} style={styles.recordItem}>
    <View style={styles.recordTime}>
      <Text style={styles.timeText}>
        {format(start, 'HH:mm')} - {end ? format(end, 'HH:mm') : 'Active'}
      </Text>
      <Text style={styles.durationText}>
        {duration.hours}h {duration.minutes}m
      </Text>
    </View>
    <View style={styles.recordInfo}>
      <Text style={styles.workerNameSmall}>{record.worker_name}</Text>
      <Text style={styles.tradeText}>{record.trade_name}</Text>
      <View style={[styles.workTypeBadge, { backgroundColor: getWorkTypeColor(record.work_type) + '20' }]}>
        <Text style={[styles.workTypeBadgeText, { color: getWorkTypeColor(record.work_type) }]}>
          {record.work_type}
        </Text>
      </View>
    </View>
    {!record.end_time && (
      <View style={styles.activeBadge}>
        <Icon name="clock" size={12} color="#4CAF50" />
        <Text style={styles.activeText}>Active</Text>
      </View>
    )}
  </View>
);
};

const getWorkTypeColor = (type) => {
const colors = {
'regular': '#2196F3',
'overtime': '#FF9800',
'weekend': '#9C27B0'
};
return colors[type] || '#666';
};

const exportTimeSheet = async () => {
Alert.alert(
"Export Time Sheet",
"Select time period:",
[
{ text: "Today", onPress: () => generateReport('today') },
{ text: "This Week", onPress: () => generateReport('week') },
{ text: "This Month", onPress: () => generateReport('month') },
{ text: "Cancel", style: "cancel" }
]
);
};

const generateReport = async (period) => {
// This would generate and export a report
Alert.alert("Report Generated", ${period} report prepared for export);
};

return (
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.headerTitle}>Time Tracking</Text>
<TouchableOpacity style={styles.exportButton} onPress={exportTimeSheet} >
<Icon name="file-export" size={20} color="#2196F3" />
<Text style={styles.exportButtonText}>Export</Text>
</TouchableOpacity>
</View>

text
  <View style={styles.summaryCard}>
    <View style={styles.summaryItem}>
      <Text style={styles.summaryNumber}>{workers.length}</Text>
      <Text style={styles.summaryLabel}>Workers</Text>
    </View>
    <View style={styles.summaryDivider} />
    <View style={styles.summaryItem}>
      <Text style={styles.summaryNumber}>{Object.keys(activeTimers).length}</Text>
      <Text style={styles.summaryLabel}>Active Now</Text>
    </View>
    <View style={styles.summaryDivider} />
    <View style={styles.summaryItem}>
      <Text style={styles.summaryNumber}>{calculateTotalHours(todayRecords).toFixed(1)}</Text>
      <Text style={styles.summaryLabel}>Hours Today</Text>
    </View>
  </View>

  <ScrollView style={styles.content}>
    <Text style={styles.sectionTitle}>Workers</Text>
    {workers.map(renderWorkerCard)}

    <View style={styles.recordsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Time Records</Text>
        <TouchableOpacity onPress={loadTodayRecords}>
          <Icon name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <Card style={styles.recordsCard}>
        <Card.Content>
          {todayRecords.length > 0 ? (
            todayRecords.map(renderTimeRecord)
          ) : (
            <View style={styles.emptyRecords}>
              <Icon name="clock-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No time records today</Text>
              <Text style={styles.emptySubtext}>Start timers to track working hours</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  </ScrollView>
</View>
);
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#f5f5f5' },
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
padding: 15,
backgroundColor: '#fff',
elevation: 2
},
headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
exportButton: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#E3F2FD',
paddingHorizontal: 15,
paddingVertical: 8,
borderRadius: 20
},
exportButtonText: { color: '#2196F3', marginLeft: 5, fontWeight: '500' },
summaryCard: {
flexDirection: 'row',
backgroundColor: '#fff',
margin: 10,
borderRadius: 10,
elevation: 2,
paddingVertical: 15
},
summaryItem: { flex: 1, alignItems: 'center' },
summaryNumber: { fontSize: 24, fontWeight: 'bold', color: '#333' },
summaryLabel: { fontSize: 12, color: '#666', marginTop: 5 },
summaryDivider: { width: 1, backgroundColor: '#eee' },
content: { flex: 1, padding: 10 },
sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
workerCard: { marginBottom: 10, elevation: 2 },
workerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
workerAvatar: {
width: 48,
height: 48,
borderRadius: 24,
backgroundColor: '#2196F3',
justifyContent: 'center',
alignItems: 'center'
},
workerInfo: { flex: 1, marginLeft: 15 },
workerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
workerTrade: { fontSize: 14, color: '#666', marginTop: 2 },
workerStats: { alignItems: 'flex-end' },
hoursText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
hoursLabel: { fontSize: 12, color: '#666' },
timerContainer: { marginBottom: 15 },
activeTimer: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center'
},
timerRunning: { flexDirection: 'row', alignItems: 'center' },
timerText: { color: '#4CAF50', marginLeft: 5, fontWeight: '500' },
stopButton: { backgroundColor: '#F44336' },
startButton: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center'
},
startButtonText: { color: '#fff', marginLeft: 5 },
workTypeSelector: { marginTop: 10 },
workTypeLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
workTypeButtons: { flexDirection: 'row' },
workTypeButton: {
flex: 1,
paddingVertical: 8,
marginHorizontal: 2,
backgroundColor: '#f0f0f0',
alignItems: 'center',
borderRadius: 5
},
workTypeButtonSelected: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#2196F3' },
workTypeButtonText: { color: '#666', textTransform: 'capitalize', fontSize: 12 },
workTypeButtonTextSelected: { color: '#2196F3', fontWeight: '500' },
recordsSection: { marginTop: 20 },
sectionHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 10
},
recordsCard: { elevation: 2 },
recordItem: {
flexDirection: 'row',
alignItems: 'center',
paddingVertical: 12,
borderBottomWidth: 1,
borderBottomColor: '#f0f0f0'
},
recordTime: { width: 100 },
timeText: { fontSize: 14, color: '#333', fontWeight: '500' },
durationText: { fontSize: 12, color: '#666', marginTop: 2 },
recordInfo: { flex: 1, marginLeft: 15 },
workerNameSmall: { fontSize: 14, color: '#333', fontWeight: '500' },
tradeText: { fontSize: 12, color: '#666', marginTop: 2 },
workTypeBadge: {
alignSelf: 'flex-start',
paddingHorizontal: 8,
paddingVertical: 2,
borderRadius: 10,
marginTop: 5
},
workTypeBadgeText: { fontSize: 10, fontWeight: '500' },
activeBadge: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#E8F5E9',
paddingHorizontal: 8,
paddingVertical: 4,
borderRadius: 12
},
activeText: { color: '#4CAF50', fontSize: 10, fontWeight: '500', marginLeft: 4 },
emptyRecords: { alignItems: 'center', padding: 30 },
emptyText: { color: '#666', fontSize: 16, fontWeight: '600', marginTop: 10 },
emptySubtext: { color: '#999', textAlign: 'center', marginTop: 5 }
});

export default TimeTracking;

