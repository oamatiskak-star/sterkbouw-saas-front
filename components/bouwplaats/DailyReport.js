import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDatabase } from '../hooks/useDatabase';
import { format } from 'date-fns';

const DailyReport = ({ projectId }) => {
const { executeQuery, executeNonQuery } = useDatabase();
const [date, setDate] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);
const [weather, setWeather] = useState('sunny');
const [temperature, setTemperature] = useState('');
const [workAreas, setWorkAreas] = useState([]);
const [workers, setWorkers] = useState([]);
const [materialsUsed, setMaterialsUsed] = useState([]);
const [activities, setActivities] = useState([]);
const [issues, setIssues] = useState([]);
const [remarks, setRemarks] = useState('');
const [existingReports, setExistingReports] = useState([]);
const [selectedReport, setSelectedReport] = useState(null);

useEffect(() => {
loadWorkAreas();
loadWorkers();
loadMaterials();
loadExistingReports();
}, [projectId]);

const loadWorkAreas = async () => {
const result = await executeQuery(
"SELECT * FROM work_areas WHERE project_id = ? ORDER BY name",
[projectId]
);
setWorkAreas(result.map(area => ({ ...area, selected: false })));
};

const loadWorkers = async () => {
const result = await executeQuery(
SELECT w.*, t.name as trade_name FROM workers w LEFT JOIN trades t ON w.trade_id = t.id WHERE w.project_id = ? AND w.active = 1 ORDER BY w.name,
[projectId]
);
setWorkers(result.map(worker => ({ ...worker, present: false })));
};

const loadMaterials = async () => {
const result = await executeQuery(
"SELECT * FROM materials WHERE project_id = ? AND status = 'on_site' ORDER BY name",
[projectId]
);
setMaterialsUsed(result.map(mat => ({ ...mat, quantity_used: 0 })));
};

const loadExistingReports = async () => {
const result = await executeQuery(
"SELECT * FROM daily_reports WHERE project_id = ? ORDER BY date DESC",
[projectId]
);
setExistingReports(result);
};

const loadReport = async (reportId) => {
const report = await executeQuery(
"SELECT * FROM daily_reports WHERE id = ?",
[reportId]
);

text
if (report.length > 0) {
  setSelectedReport(report[0]);
  setDate(new Date(report[0].date));
  setWeather(report[0].weather || 'sunny');
  setTemperature(report[0].temperature || '');
  setRemarks(report[0].remarks || '');
  
  // Load report details
  const areas = await executeQuery(
    "SELECT area_id FROM report_areas WHERE report_id = ?",
    [reportId]
  );
  setWorkAreas(prev => prev.map(area => ({
    ...area,
    selected: areas.some(a => a.area_id === area.id)
  })));
  
  const workersPresent = await executeQuery(
    "SELECT worker_id FROM report_workers WHERE report_id = ?",
    [reportId]
  );
  setWorkers(prev => prev.map(worker => ({
    ...worker,
    present: workersPresent.some(w => w.worker_id === worker.id)
  })));
  
  const materials = await executeQuery(
    "SELECT material_id, quantity_used FROM report_materials WHERE report_id = ?",
    [reportId]
  );
  setMaterialsUsed(prev => prev.map(mat => {
    const material = materials.find(m => m.material_id === mat.id);
    return {
      ...mat,
      quantity_used: material ? material.quantity_used : 0
    };
  }));
  
  const activitiesList = await executeQuery(
    "SELECT * FROM report_activities WHERE report_id = ? ORDER BY order_index",
    [reportId]
  );
  setActivities(activitiesList);
  
  const issuesList = await executeQuery(
    "SELECT * FROM report_issues WHERE report_id = ? ORDER BY created_date",
    [reportId]
  );
  setIssues(issuesList);
}
};

const addActivity = () => {
Alert.prompt(
"Add Activity",
"Enter activity description:",
(text) => {
if (text) {
setActivities([...activities, {
id: Date.now(),
description: text,
status: 'in_progress'
}]);
}
}
);
};

const addIssue = () => {
Alert.prompt(
"Add Issue",
"Enter issue description:",
(text) => {
if (text) {
setIssues([...issues, {
id: Date.now(),
description: text,
severity: 'medium',
status: 'open'
}]);
}
}
);
};

const saveReport = async () => {
try {
// Save main report
const result = await executeNonQuery(
INSERT INTO daily_reports (project_id, date, weather, temperature, remarks, created_date) VALUES (?, ?, ?, ?, ?, ?),
[projectId, date.toISOString(), weather, temperature, remarks, new Date().toISOString()]
);

text
  const reportId = result.insertId;
  
  // Save work areas
  for (const area of workAreas.filter(a => a.selected)) {
    await executeNonQuery(
      "INSERT INTO report_areas (report_id, area_id) VALUES (?, ?)",
      [reportId, area.id]
    );
  }
  
  // Save workers
  for (const worker of workers.filter(w => w.present)) {
    await executeNonQuery(
      "INSERT INTO report_workers (report_id, worker_id) VALUES (?, ?)",
      [reportId, worker.id]
    );
  }
  
  // Save materials used
  for (const material of materialsUsed.filter(m => m.quantity_used > 0)) {
    await executeNonQuery(
      "INSERT INTO report_materials (report_id, material_id, quantity_used) VALUES (?, ?, ?)",
      [reportId, material.id, material.quantity_used]
    );
    
    // Update material quantity
    await executeNonQuery(
      "UPDATE materials SET quantity = quantity - ? WHERE id = ?",
      [material.quantity_used, material.id]
    );
  }
  
  // Save activities
  for (const [index, activity] of activities.entries()) {
    await executeNonQuery(
      `INSERT INTO report_activities (report_id, description, status, order_index) 
       VALUES (?, ?, ?, ?)`,
      [reportId, activity.description, activity.status, index]
    );
  }
  
  // Save issues
  for (const issue of issues) {
    await executeNonQuery(
      `INSERT INTO report_issues (report_id, description, severity, status) 
       VALUES (?, ?, ?, ?)`,
      [reportId, issue.description, issue.severity, issue.status]
    );
  }
  
  Alert.alert("Success", "Daily report saved successfully!");
  loadExistingReports();
  resetForm();
} catch (error) {
  console.error('Error saving report:', error);
  Alert.alert("Error", "Failed to save daily report");
}
};

const resetForm = () => {
setSelectedReport(null);
setDate(new Date());
setWeather('sunny');
setTemperature('');
setRemarks('');
setWorkAreas(prev => prev.map(area => ({ ...area, selected: false })));
setWorkers(prev => prev.map(worker => ({ ...worker, present: false })));
setMaterialsUsed(prev => prev.map(mat => ({ ...mat, quantity_used: 0 })));
setActivities([]);
setIssues([]);
};

const renderWorkAreas = () => (
<Card style={styles.sectionCard}>
<Card.Content>
<View style={styles.sectionHeader}>
<Icon name="map-marker" size={20} color="#666" />
<Text style={styles.sectionTitle}>Work Areas Active Today</Text>
</View>
<View style={styles.checkboxGrid}>
{workAreas.map(area => (
<TouchableOpacity
key={area.id}
style={[styles.checkboxItem, area.selected && styles.checkboxItemSelected]}
onPress={() => toggleWorkArea(area.id)}
>
<Icon
name={area.selected ? "checkbox-marked" : "checkbox-blank-outline"}
size={20}
color={area.selected ? "#2196F3" : "#666"}
/>
<Text style={[styles.checkboxText, area.selected && styles.checkboxTextSelected]}>
{area.name}
</Text>
</TouchableOpacity>
))}
</View>
</Card.Content>
</Card>
);

const renderWorkers = () => (
<Card style={styles.sectionCard}>
<Card.Content>
<View style={styles.sectionHeader}>
<Icon name="account-group" size={20} color="#666" />
<Text style={styles.sectionTitle}>Workers Present ({workers.filter(w => w.present).length})</Text>
</View>
<View style={styles.checkboxGrid}>
{workers.map(worker => (
<TouchableOpacity
key={worker.id}
style={[styles.checkboxItem, worker.present && styles.checkboxItemSelected]}
onPress={() => toggleWorker(worker.id)}
>
<Icon
name={worker.present ? "checkbox-marked" : "checkbox-blank-outline"}
size={20}
color={worker.present ? "#2196F3" : "#666"}
/>
<View>
<Text style={[styles.checkboxText, worker.present && styles.checkboxTextSelected]}>
{worker.name}
</Text>
<Text style={styles.checkboxSubtext}>{worker.trade_name}</Text>
</View>
</TouchableOpacity>
))}
</View>
</Card.Content>
</Card>
);

const renderMaterials = () => (
<Card style={styles.sectionCard}>
<Card.Content>
<View style={styles.sectionHeader}>
<Icon name="package-variant" size={20} color="#666" />
<Text style={styles.sectionTitle}>Materials Used</Text>
</View>
{materialsUsed.map(material => (
<View key={material.id} style={styles.materialRow}>
<View style={{ flex: 1 }}>
<Text style={styles.materialName}>{material.name}</Text>
<Text style={styles.materialInfo}>
Available: {material.quantity} {material.unit}
</Text>
</View>
<TextInput
style={styles.quantityInput}
keyboardType="numeric"
value={material.quantity_used.toString()}
onChangeText={(text) => updateMaterialQuantity(material.id, text)}
placeholder="0"
/>
<Text style={styles.materialUnit}>{material.unit}</Text>
</View>
))}
</Card.Content>
</Card>
);

const renderActivities = () => (
<Card style={styles.sectionCard}>
<Card.Content>
<View style={styles.sectionHeader}>
<Icon name="clipboard-list" size={20} color="#666" />
<Text style={styles.sectionTitle}>Daily Activities</Text>
<TouchableOpacity onPress={addActivity} style={styles.addButton}>
<Icon name="plus" size={20} color="#2196F3" />
</TouchableOpacity>
</View>
{activities.map((activity, index) => (
<View key={activity.id} style={styles.activityItem}>
<Text style={styles.activityNumber}>{index + 1}.</Text>
<Text style={styles.activityText}>{activity.description}</Text>
<View style={[styles.activityStatus, { backgroundColor: getStatusColor(activity.status) }]}>
<Text style={styles.activityStatusText}>{activity.status}</Text>
</View>
</View>
))}
{activities.length === 0 && (
<Text style={styles.emptyText}>No activities added yet</Text>
)}
</Card.Content>
</Card>
);

const renderIssues = () => (
<Card style={styles.sectionCard}>
<Card.Content>
<View style={styles.sectionHeader}>
<Icon name="alert-circle" size={20} color="#666" />
<Text style={styles.sectionTitle}>Issues & Delays</Text>
<TouchableOpacity onPress={addIssue} style={styles.addButton}>
<Icon name="plus" size={20} color="#2196F3" />
</TouchableOpacity>
</View>
{issues.map(issue => (
<View key={issue.id} style={styles.issueItem}>
<Icon name="alert" size={16} color={getSeverityColor(issue.severity)} />
<Text style={styles.issueText}>{issue.description}</Text>
</View>
))}
{issues.length === 0 && (
<Text style={styles.emptyText}>No issues reported</Text>
)}
</Card.Content>
</Card>
);

const toggleWorkArea = (id) => {
setWorkAreas(prev => prev.map(area =>
area.id === id ? { ...area, selected: !area.selected } : area
));
};

const toggleWorker = (id) => {
setWorkers(prev => prev.map(worker =>
worker.id === id ? { ...worker, present: !worker.present } : worker
));
};

const updateMaterialQuantity = (id, value) => {
const numValue = parseFloat(value) || 0;
setMaterialsUsed(prev => prev.map(mat =>
mat.id === id ? { ...mat, quantity_used: numValue } : mat
));
};

const getStatusColor = (status) => {
const colors = {
'completed': '#4CAF50',
'in_progress': '#FF9800',
'not_started': '#9E9E9E',
'delayed': '#F44336'
};
return colors[status] || '#666';
};

const getSeverityColor = (severity) => {
const colors = {
'low': '#4CAF50',
'medium': '#FF9800',
'high': '#F44336',
'critical': '#D32F2F'
};
return colors[severity] || '#666';
};

return (
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.headerTitle}>Daily Construction Report</Text>
<TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
<Icon name="calendar" size={20} color="#2196F3" />
<Text style={styles.dateText}>{format(date, 'dd-MM-yyyy')}</Text>
</TouchableOpacity>
</View>

text
  {showDatePicker && (
    <DateTimePicker
      value={date}
      mode="date"
      display="default"
      onChange={(event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
      }}
    />
  )}

  <ScrollView style={styles.content}>
    <Card style={styles.weatherCard}>
      <Card.Content>
        <View style={styles.weatherHeader}>
          <Text style={styles.weatherTitle}>Weather Conditions</Text>
          <View style={styles.weatherButtons}>
            {['sunny', 'cloudy', 'rainy', 'stormy'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.weatherButton, weather === type && styles.weatherButtonSelected]}
                onPress={() => setWeather(type)}
              >
                <Icon 
                  name={type === 'sunny' ? 'weather-sunny' : 
                        type === 'cloudy' ? 'weather-cloudy' : 
                        type === 'rainy' ? 'weather-rainy' : 'weather-lightning'} 
                  size={24} 
                  color={weather === type ? '#fff' : '#666'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TextInput
          label="Temperature (°C)"
          value={temperature}
          onChangeText={setTemperature}
          keyboardType="numeric"
          style={styles.temperatureInput}
        />
      </Card.Content>
    </Card>

    {renderWorkAreas()}
    {renderWorkers()}
    {renderMaterials()}
    {renderActivities()}
    {renderIssues()}

    <Card style={styles.remarksCard}>
      <Card.Content>
        <Text style={styles.remarksTitle}>Remarks & Notes</Text>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={4}
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Enter any additional remarks, observations, or notes for today..."
          style={styles.remarksInput}
        />
      </Card.Content>
    </Card>

    <View style={styles.buttonRow}>
      <Button mode="outlined" onPress={resetForm} style={[styles.button, styles.cancelButton]}>
        Clear Form
      </Button>
      <Button mode="contained" onPress={saveReport} style={[styles.button, styles.saveButton]}>
        Save Daily Report
      </Button>
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
dateButton: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#E3F2FD',
paddingHorizontal: 15,
paddingVertical: 8,
borderRadius: 20
},
dateText: { color: '#2196F3', marginLeft: 5, fontWeight: '500' },
content: { flex: 1, padding: 10 },
weatherCard: { marginBottom: 10 },
weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
weatherTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
weatherButtons: { flexDirection: 'row' },
weatherButton: {
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: '#f0f0f0',
justifyContent: 'center',
alignItems: 'center',
marginLeft: 10
},
weatherButtonSelected: { backgroundColor: '#2196F3' },
temperatureInput: { backgroundColor: '#fff' },
sectionCard: { marginBottom: 10 },
sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 10, flex: 1 },
addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
checkboxGrid: { flexDirection: 'row', flexWrap: 'wrap' },
checkboxItem: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#f0f0f0',
paddingHorizontal: 12,
paddingVertical: 8,
borderRadius: 20,
marginRight: 10,
marginBottom: 10
},
checkboxItemSelected: { backgroundColor: '#E3F2FD' },
checkboxText: { fontSize: 14, color: '#666', marginLeft: 5 },
checkboxTextSelected: { color: '#2196F3', fontWeight: '500' },
checkboxSubtext: { fontSize: 10, color: '#999', marginLeft: 5 },
materialRow: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 15,
backgroundColor: '#f9f9f9',
padding: 10,
borderRadius: 8
},
materialName: { fontSize: 14, fontWeight: '500', color: '#333' },
materialInfo: { fontSize: 12, color: '#666', marginTop: 2 },
quantityInput: {
width: 60,
height: 36,
backgroundColor: '#fff',
borderWidth: 1,
borderColor: '#ddd',
borderRadius: 5,
textAlign: 'center',
marginHorizontal: 10
},
materialUnit: { fontSize: 14, color: '#666', minWidth: 40 },
activityItem: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 10,
paddingVertical: 8,
borderBottomWidth: 1,
borderBottomColor: '#f0f0f0'
},
activityNumber: { fontSize: 14, color: '#666', marginRight: 10, minWidth: 25 },
activityText: { flex: 1, fontSize: 14, color: '#333' },
activityStatus: {
paddingHorizontal: 8,
paddingVertical: 3,
borderRadius: 12,
marginLeft: 10
},
activityStatusText: { fontSize: 10, color: '#fff', fontWeight: '500' },
issueItem: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 10,
paddingVertical: 8,
borderBottomWidth: 1,
borderBottomColor: '#f0f0f0'
},
issueText: { flex: 1, fontSize: 14, color: '#333', marginLeft: 10 },
emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 20 },
remarksCard: { marginBottom: 20 },
remarksTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
remarksInput: { backgroundColor: '#fff' },
buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
button: { flex: 1, marginHorizontal: 5 },
cancelButton: { borderColor: '#666' },
saveButton: { backgroundColor: '#2196F3' }
});

export default DailyReport;

