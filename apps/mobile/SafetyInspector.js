import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Checkbox, Card, Button, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDatabase } from '../hooks/useDatabase';
import { format } from 'date-fns';

const SafetyInspector = ({ projectId }) => {
const { executeQuery, executeNonQuery } = useDatabase();
const [checklists, setChecklists] = useState([]);
const [selectedChecklist, setSelectedChecklist] = useState(null);
const [items, setItems] = useState([]);
const [remarks, setRemarks] = useState('');

useEffect(() => {
loadChecklists();
}, [projectId]);

const loadChecklists = async () => {
const result = await executeQuery(
"SELECT * FROM safety_checklists WHERE project_id = ? ORDER BY created_date DESC",
[projectId]
);
setChecklists(result);
};

const loadChecklistItems = async (checklistId) => {
const checklist = checklists.find(c => c.id === checklistId);
setSelectedChecklist(checklist);

text
const result = await executeQuery(
  `SELECT si.*, sc.category 
   FROM safety_items si 
   LEFT JOIN safety_categories sc ON si.category_id = sc.id 
   WHERE si.checklist_id = ? 
   ORDER BY sc.order_index, si.order_index`,
  [checklistId]
);
setItems(result);
setRemarks(checklist?.remarks || '');
};

const toggleItem = async (itemId, currentStatus) => {
const newStatus = currentStatus === 'compliant' ? 'non_compliant' : 'compliant';
await executeNonQuery(
"UPDATE safety_items SET status = ? WHERE id = ?",
[newStatus, itemId]
);
loadChecklistItems(selectedChecklist.id);
};

const saveChecklist = async () => {
if (!selectedChecklist) return;

text
await executeNonQuery(
  "UPDATE safety_checklists SET remarks = ?, completed_date = ? WHERE id = ?",
  [remarks, new Date().toISOString(), selectedChecklist.id]
);

Alert.alert("Success", "Safety checklist saved successfully!");
loadChecklists();
setSelectedChecklist(null);
setItems([]);
};

const createNewChecklist = async () => {
Alert.prompt(
"New Safety Checklist",
"Enter checklist title:",
async (title) => {
if (title) {
const result = await executeNonQuery(
"INSERT INTO safety_checklists (project_id, title, created_date) VALUES (?, ?, ?)",
[projectId, title, new Date().toISOString()]
);

text
      // Create default items
      const categories = await executeQuery("SELECT * FROM safety_categories ORDER BY order_index");
      for (const category of categories) {
        const defaultItems = [
          "Personal protective equipment (PPE) available and used",
          "Safe access and egress maintained",
          "Tools and equipment in safe condition",
          "Fall protection installed where required",
          "Adequate lighting and ventilation",
          "Hazard signs properly placed",
          "Emergency exits unobstructed"
        ];
        
        for (const [index, itemText] of defaultItems.entries()) {
          await executeNonQuery(
            `INSERT INTO safety_items (checklist_id, category_id, description, order_index, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [result.insertId, category.id, itemText, index, 'pending']
          );
        }
      }
      
      loadChecklists();
    }
  }
);
};

const getComplianceRate = () => {
if (items.length === 0) return 0;
const compliant = items.filter(item => item.status === 'compliant').length;
return Math.round((compliant / items.length) * 100);
};

const renderCategorySection = (category, categoryItems) => (
<View key={category} style={styles.categorySection}>
<Text style={styles.categoryTitle}>{category}</Text>
{categoryItems.map(item => (
<Card key={item.id} style={styles.itemCard}>
<Card.Content style={styles.itemContent}>
<View style={{ flex: 1 }}>
<Text style={styles.itemText}>{item.description}</Text>
</View>
<TouchableOpacity
style={[styles.statusButton, item.status === 'compliant' ? styles.compliant : styles.nonCompliant]}
onPress={() => toggleItem(item.id, item.status)}
>
<Icon
name={item.status === 'compliant' ? 'check-circle' : 'alert-circle'}
color="#fff"
size={20}
/>
<Text style={styles.statusButtonText}>
{item.status === 'compliant' ? 'Compliant' : 'Non-Compliant'}
</Text>
</TouchableOpacity>
</Card.Content>
</Card>
))}
</View>
);

if (selectedChecklist) {
const itemsByCategory = items.reduce((acc, item) => {
const category = item.category || 'General';
if (!acc[category]) acc[category] = [];
acc[category].push(item);
return acc;
}, {});

text
return (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => setSelectedChecklist(null)} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{selectedChecklist.title}</Text>
      <View style={styles.complianceBadge}>
        <Text style={styles.complianceText}>{getComplianceRate()}% Compliant</Text>
      </View>
    </View>

    <ScrollView style={styles.content}>
      {Object.entries(itemsByCategory).map(([category, categoryItems]) =>
        renderCategorySection(category, categoryItems)
      )}

      <Card style={styles.remarksCard}>
        <Card.Content>
          <Text style={styles.remarksTitle}>Remarks & Observations</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Enter any observations, issues, or comments..."
            style={styles.remarksInput}
          />
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={saveChecklist} style={styles.saveButton}>
        Save Safety Checklist
      </Button>
    </ScrollView>
  </View>
);
}

return (
<View style={styles.container}>
<View style={styles.listHeader}>
<Text style={styles.listTitle}>Safety Checklists</Text>
<Button mode="contained" onPress={createNewChecklist} style={styles.newButton}>
New Checklist
</Button>
</View>

text
  <ScrollView style={styles.listContainer}>
    {checklists.map(checklist => (
      <TouchableOpacity
        key={checklist.id}
        onPress={() => loadChecklistItems(checklist.id)}
        style={styles.checklistCard}
      >
        <View style={styles.checklistHeader}>
          <Icon name="clipboard-check" size={24} color="#2196F3" />
          <View style={styles.checklistInfo}>
            <Text style={styles.checklistTitle}>{checklist.title}</Text>
            <Text style={styles.checklistDate}>
              Created: {format(new Date(checklist.created_date), 'dd-MM-yyyy')}
            </Text>
          </View>
        </View>
        <View style={styles.checklistFooter}>
          <View style={[styles.statusBadge, checklist.completed_date ? styles.completed : styles.pending]}>
            <Text style={styles.statusText}>
              {checklist.completed_date ? 'Completed' : 'In Progress'}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    ))}

    {checklists.length === 0 && (
      <View style={styles.emptyContainer}>
        <Icon name="clipboard-text-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No safety checklists yet</Text>
        <Text style={styles.emptySubtext}>Create your first safety inspection checklist</Text>
        <Button mode="contained" onPress={createNewChecklist} style={styles.emptyButton}>
          Create Checklist
        </Button>
      </View>
    )}
  </ScrollView>
</View>
);
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#f5f5f5' },
header: {
flexDirection: 'row',
alignItems: 'center',
padding: 15,
backgroundColor: '#fff',
elevation: 2
},
backButton: { marginRight: 15 },
headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#333' },
complianceBadge: {
backgroundColor: '#4CAF50',
paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 15
},
complianceText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
content: { flex: 1, padding: 10 },
categorySection: { marginBottom: 15 },
categoryTitle: {
fontSize: 16,
fontWeight: '600',
color: '#333',
marginBottom: 10,
paddingLeft: 5
},
itemCard: { marginBottom: 8, elevation: 1 },
itemContent: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between'
},
itemText: { flex: 1, fontSize: 14, color: '#333', marginRight: 10 },
statusButton: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 15
},
compliant: { backgroundColor: '#4CAF50' },
nonCompliant: { backgroundColor: '#F44336' },
statusButtonText: { color: '#fff', marginLeft: 5, fontSize: 12, fontWeight: '500' },
remarksCard: { marginTop: 20, marginBottom: 20 },
remarksTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
remarksInput: { backgroundColor: '#fff' },
saveButton: { marginBottom: 30, marginHorizontal: 10 },
listHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
padding: 15,
backgroundColor: '#fff'
},
listTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
newButton: { backgroundColor: '#2196F3' },
listContainer: { flex: 1, padding: 10 },
checklistCard: {
backgroundColor: '#fff',
borderRadius: 8,
padding: 15,
marginBottom: 10,
elevation: 2
},
checklistHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
checklistInfo: { flex: 1, marginLeft: 15 },
checklistTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
checklistDate: { fontSize: 12, color: '#666', marginTop: 2 },
checklistFooter: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
borderTopWidth: 1,
borderTopColor: '#eee',
paddingTop: 10
},
statusBadge: {
paddingHorizontal: 12,
paddingVertical: 4,
borderRadius: 12
},
completed: { backgroundColor: '#E8F5E9' },
pending: { backgroundColor: '#FFF3E0' },
statusText: { fontSize: 12, fontWeight: '500' },
completedText: { color: '#4CAF50' },
pendingText: { color: '#FF9800' },
emptyContainer: {
alignItems: 'center',
justifyContent: 'center',
padding: 40,
marginTop: 50
},
emptyText: { color: '#666', fontSize: 18, fontWeight: '600', marginTop: 15 },
emptySubtext: { color: '#999', textAlign: 'center', marginTop: 5, marginBottom: 20 },
emptyButton: { backgroundColor: '#2196F3' }
});

export default SafetyInspector;
