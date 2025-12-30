import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card, Button, TextInput, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDatabase } from '../hooks/useDatabase';
import { format } from 'date-fns';

const IssueTracker = ({ projectId }) => {
const { executeQuery, executeNonQuery } = useDatabase();
const [issues, setIssues] = useState([]);
const [filter, setFilter] = useState('all'); // all, open, closed, high_priority
const [newIssue, setNewIssue] = useState({
title: '',
description: '',
category: 'safety',
priority: 'medium',
location: '',
assigned_to: null
});
const [showNewForm, setShowNewForm] = useState(false);
const [workers, setWorkers] = useState([]);

useEffect(() => {
loadIssues();
loadWorkers();
}, [projectId, filter]);

const loadIssues = async () => {
let query = SELECT i.*, w.name as reporter_name, a.name as assigned_name, c.name as category_name FROM issues i LEFT JOIN workers w ON i.reported_by = w.id LEFT JOIN workers a ON i.assigned_to = a.id LEFT JOIN issue_categories c ON i.category = c.id WHERE i.project_id = ?;

text
if (filter === 'open') query += " AND i.status = 'open'";
if (filter === 'closed') query += " AND i.status = 'closed'";
if (filter === 'high_priority') query += " AND i.priority = 'high'";

query += " ORDER BY i.priority DESC, i.created_date DESC";

const result = await executeQuery(query, [projectId]);
setIssues(result);
};

const loadWorkers = async () => {
const result = await executeQuery(
"SELECT id, name FROM workers WHERE project_id = ? AND active = 1 ORDER BY name",
[projectId]
);
setWorkers(result);
};

const createIssue = async () => {
if (!newIssue.title.trim() || !newIssue.description.trim()) {
Alert.alert("Error", "Please fill in title and description");
return;
}

text
try {
  await executeNonQuery(
    `INSERT INTO issues (project_id, title, description, category, priority, location, status, created_date, reported_by) 
     VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
    [projectId, newIssue.title, newIssue.description, newIssue.category, 
     newIssue.priority, newIssue.location, new Date().toISOString(), 1] // reported_by would be current user
  );
  
  Alert.alert("Success", "Issue reported successfully!");
  setNewIssue({
    title: '',
    description: '',
    category: 'safety',
    priority: 'medium',
    location: '',
    assigned_to: null
  });
  setShowNewForm(false);
  loadIssues();
} catch (error) {
  console.error('Error creating issue:', error);
  Alert.alert("Error", "Failed to create issue");
}
};

const updateIssueStatus = async (id, newStatus) => {
await executeNonQuery(
"UPDATE issues SET status = ?, updated_date = ? WHERE id = ?",
[newStatus, new Date().toISOString(), id]
);
loadIssues();
};

const assignIssue = async (id, workerId) => {
await executeNonQuery(
"UPDATE issues SET assigned_to = ?, updated_date = ? WHERE id = ?",
[workerId, new Date().toISOString(), id]
);
loadIssues();
};

const getPriorityColor = (priority) => {
const colors = {
'low': '#4CAF50',
'medium': '#FF9800',
'high': '#F44336',
'critical': '#D32F2F'
};
return colors[priority] || '#666';
};

const getStatusColor = (status) => {
const colors = {
'open': '#F44336',
'in_progress': '#FF9800',
'resolved': '#4CAF50',
'closed': '#9E9E9E'
};
return colors[status] || '#666';
};

const getCategoryIcon = (category) => {
const icons = {
'safety': 'shield-alert',
'quality': 'certificate',
'schedule': 'calendar-clock',
'material': 'package-variant',
'equipment': 'tools',
'labor': 'account-hard-hat',
'other': 'alert-circle'
};
return icons[category] || 'alert-circle';
};

const renderIssueCard = (issue) => (
<Card key={issue.id} style={styles.issueCard}>
<Card.Content>
<View style={styles.issueHeader}>
<View style={styles.categoryIcon}>
<Icon name={getCategoryIcon(issue.category)} size={20} color="#fff" />
</View>
<View style={{ flex: 1, marginLeft: 10 }}>
<Text style={styles.issueTitle}>{issue.title}</Text>
<View style={styles.issueMeta}>
<Text style={styles.issueCategory}>{issue.category_name || issue.category}</Text>
<Text style={styles.issueDate}>
{format(new Date(issue.created_date), 'dd-MM-yyyy')}
</Text>
</View>
</View>
<View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
<Text style={styles.priorityText}>{issue.priority}</Text>
</View>
</View>

text
    <Text style={styles.issueDescription}>{issue.description}</Text>
    
    {issue.location && (
      <View style={styles.issueLocation}>
        <Icon name="map-marker" size={14} color="#666" />
        <Text style={styles.locationText}>{issue.location}</Text>
      </View>
    )}
    
    <View style={styles.issueFooter}>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(issue.status) }]}>
          {issue.status}
        </Text>
      </View>
      
      <View style={styles.assigneeContainer}>
        {issue.assigned_name ? (
          <View style={styles.assignedTo}>
            <Icon name="account" size={14} color="#666" />
            <Text style={styles.assigneeText}>{issue.assigned_name}</Text>
          </View>
        ) : (
          <Button 
            mode="outlined" 
            compact 
            onPress={() => showAssignmentModal(issue.id)}
            style={styles.assignButton}
          >
            Assign
          </Button>
        )}
      </View>
    </View>
    
    <View style={styles.actionButtons}>
      {issue.status === 'open' && (
        <Button 
          mode="contained" 
          compact 
          onPress={() => updateIssueStatus(issue.id, 'in_progress')}
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
        >
          Start
        </Button>
      )}
      
      {issue.status === 'in_progress' && (
        <Button 
          mode="contained" 
          compact 
          onPress={() => updateIssueStatus(issue.id, 'resolved')}
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
        >
          Resolve
        </Button>
      )}
      
      {issue.status === 'resolved' && (
        <Button 
          mode="contained" 
          compact 
          onPress={() => updateIssueStatus(issue.id, 'closed')}
          style={[styles.actionButton, { backgroundColor: '#9E9E9E' }]}
        >
          Close
        </Button>
      )}
      
      <Button 
        mode="outlined" 
        compact 
        onPress={() => {/* View details */}}
        style={styles.actionButton}
      >
        Details
      </Button>
    </View>
  </Card.Content>
</Card>
);

const showAssignmentModal = (issueId) => {
Alert.alert(
"Assign Issue",
"Select worker to assign:",
workers.map(worker => ({
text: worker.name,
onPress: () => assignIssue(issueId, worker.id)
})).concat([{ text: "Cancel", style: "cancel" }])
);
};

if (showNewForm) {
return (
<ScrollView style={styles.container}>
<View style={styles.header}>
<TouchableOpacity onPress={() => setShowNewForm(false)} style={styles.backButton}>
<Icon name="arrow-left" size={24} color="#333" />
</TouchableOpacity>
<Text style={styles.headerTitle}>Report New Issue</Text>
</View>

text
    <Card style={styles.formCard}>
      <Card.Content>
        <TextInput
          label="Issue Title"
          value={newIssue.title}
          onChangeText={(text) => setNewIssue({...newIssue, title: text})}
          style={styles.input}
        />
        
        <TextInput
          label="Description"
          value={newIssue.description}
          onChangeText={(text) => setNewIssue({...newIssue, description: text})}
          multiline
          numberOfLines={4}
          style={styles.input}
        />
        
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {['safety', 'quality', 'schedule', 'material', 'equipment', 'labor', 'other'].map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, newIssue.category === category && styles.categoryButtonSelected]}
              onPress={() => setNewIssue({...newIssue, category})}
            >
              <Icon 
                name={getCategoryIcon(category)} 
                size={20} 
                color={newIssue.category === category ? '#2196F3' : '#666'} 
              />
              <Text style={[styles.categoryText, newIssue.category === category && styles.categoryTextSelected]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionLabel}>Priority</Text>
        <View style={styles.priorityButtons}>
          {['low', 'medium', 'high', 'critical'].map(priority => (
            <TouchableOpacity
              key={priority}
              style={[styles.priorityButton, newIssue.priority === priority && styles.priorityButtonSelected]}
              onPress={() => setNewIssue({...newIssue, priority})}
            >
              <Text style={[styles.priorityButtonText, newIssue.priority === priority && styles.priorityButtonTextSelected]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TextInput
          label="Location (optional)"
          value={newIssue.location}
          onChangeText={(text) => setNewIssue({...newIssue, location: text})}
          style={styles.input}
          placeholder="e.g., West Wing, Ground Floor"
        />
        
        <View style={styles.formActions}>
          <Button mode="outlined" onPress={() => setShowNewForm(false)} style={styles.formButton}>
            Cancel
          </Button>
          <Button mode="contained" onPress={createIssue} style={styles.formButton}>
            Report Issue
          </Button>
        </View>
      </Card.Content>
    </Card>
  </ScrollView>
);
}

return (
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.headerTitle}>Issue Tracker</Text>
<TouchableOpacity
style={styles.newIssueButton}
onPress={() => setShowNewForm(true)}
>
<Icon name="plus" size={20} color="#fff" />
<Text style={styles.newIssueButtonText}>New Issue</Text>
</TouchableOpacity>
</View>

text
  <View style={styles.filterContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'open' && styles.filterButtonActive]}
        onPress={() => setFilter('open')}
      >
        <Text style={[styles.filterText, filter === 'open' && styles.filterTextActive]}>Open</Text>
        <View style={[styles.filterBadge, filter === 'open' && styles.filterBadgeActive]}>
          <Text style={styles.filterBadgeText}>
            {issues.filter(i => i.status === 'open').length}
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'closed' && styles.filterButtonActive]}
        onPress={() => setFilter('closed')}
      >
        <Text style={[styles.filterText, filter === 'closed' && styles.filterTextActive]}>Closed</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'high_priority' && styles.filterButtonActive]}
        onPress={() => setFilter('high_priority')}
      >
        <Text style={[styles.filterText, filter === 'high_priority' && styles.filterTextActive]}>High Priority</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
  
  <ScrollView style={styles.issuesList}>
    {issues.map(renderIssueCard)}
    
    {issues.length === 0 && (
      <View style={styles.emptyContainer}>
        <Icon name="check-circle-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No issues found</Text>
        <Text style={styles.emptySubtext}>
          {filter === 'all' 
            ? "Start by reporting your first issue" 
            : `No ${filter} issues at the moment`}
        </Text>
        {filter !== 'all' && (
          <Button mode="outlined" onPress={() => setFilter('all')} style={styles.emptyButton}>
            View All Issues
          </Button>
        )}
      </View>
    )}
  </ScrollView>
  
  <View style={styles.statsBar}>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{issues.filter(i => i.status === 'open').length}</Text>
      <Text style={styles.statLabel}>Open</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{issues.filter(i => i.status === 'in_progress').length}</Text>
      <Text style={styles.statLabel}>In Progress</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{issues.filter(i => i.priority === 'high' || i.priority === 'critical').length}</Text>
      <Text style={styles.statLabel}>High Priority</Text>
    </View>
  </View>
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
backButton: { padding: 5 },
newIssueButton: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#2196F3',
paddingHorizontal: 15,
paddingVertical: 8,
borderRadius: 20
},
newIssueButtonText: { color: '#fff', marginLeft: 5, fontWeight: '500' },
filterContainer: {
paddingVertical: 10,
paddingHorizontal: 15,
backgroundColor: '#fff',
borderBottomWidth: 1,
borderBottomColor: '#eee'
},
filterButton: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 15,
paddingVertical: 8,
borderRadius: 20,
backgroundColor: '#f0f0f0',
marginRight: 10
},
filterButtonActive: { backgroundColor: '#2196F3' },
filterText: { color: '#666', fontWeight: '500' },
filterTextActive: { color: '#fff' },
filterBadge: {
backgroundColor: '#fff',
paddingHorizontal: 6,
paddingVertical: 2,
borderRadius: 10,
marginLeft: 5
},
filterBadgeActive: { backgroundColor: '#1976D2' },
filterBadgeText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
issuesList: { flex: 1, padding: 10 },
issueCard: { marginBottom: 10, elevation: 2 },
issueHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
categoryIcon: {
width: 36,
height: 36,
borderRadius: 18,
backgroundColor: '#2196F3',
justifyContent: 'center',
alignItems: 'center'
},
issueTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
issueMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
issueCategory: { fontSize: 12, color: '#666' },
issueDate: { fontSize: 12, color: '#999' },
priorityBadge: {
paddingHorizontal: 10,
paddingVertical: 4,
borderRadius: 12
},
priorityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
issueDescription: {
fontSize: 14,
color: '#333',
marginBottom: 10,
lineHeight: 20
},
issueLocation: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 10
},
locationText: { fontSize: 12, color: '#666', marginLeft: 5 },
issueFooter: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 10
},
statusBadge: {
paddingHorizontal: 10,
paddingVertical: 4,
borderRadius: 12
},
statusText: { fontSize: 12, fontWeight: '500' },
assigneeContainer: { flexDirection: 'row', alignItems: 'center' },
assignedTo: { flexDirection: 'row', alignItems: 'center' },
assigneeText: { fontSize: 12, color: '#666', marginLeft: 5 },
assignButton: { borderColor: '#2196F3' },
actionButtons: {
flexDirection: 'row',
justifyContent: 'flex-end'
},
actionButton: { marginLeft: 10 },
emptyContainer: {
alignItems: 'center',
justifyContent: 'center',
padding: 40,
marginTop: 50
},
emptyText: { color: '#666', fontSize: 18, fontWeight: '600', marginTop: 15 },
emptySubtext: { color: '#999', textAlign: 'center', marginTop: 5, marginBottom: 20 },
emptyButton: { borderColor: '#666' },
statsBar: {
flexDirection: 'row',
backgroundColor: '#fff',
paddingVertical: 15,
borderTopWidth: 1,
borderTopColor: '#eee'
},
statItem: { flex: 1, alignItems: 'center' },
statNumber: { fontSize: 20, fontWeight: 'bold', color: '#333' },
statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
statDivider: { width: 1, backgroundColor: '#eee' },
formCard: { margin: 10 },
input: { marginBottom: 15, backgroundColor: '#fff' },
sectionLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 5 },
categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
categoryButton: {
alignItems: 'center',
width: '30%',
padding: 10,
margin: 5,
backgroundColor: '#f0f0f0',
borderRadius: 8
},
categoryButtonSelected: { backgroundColor: '#E3F2FD' },
categoryText: { fontSize: 12, color: '#666', marginTop: 5, textTransform: 'capitalize' },
categoryTextSelected: { color: '#2196F3', fontWeight: '500' },
priorityButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
priorityButton: {
flex: 1,
paddingVertical: 10,
marginHorizontal: 5,
backgroundColor: '#f0f0f0',
alignItems: 'center',
borderRadius: 8
},
priorityButtonSelected: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#2196F3' },
priorityButtonText: { color: '#666', textTransform: 'capitalize' },
priorityButtonTextSelected: { color: '#2196F3', fontWeight: '500' },
formActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
formButton: { flex: 1, marginHorizontal: 5 }
});

export default IssueTracker;
