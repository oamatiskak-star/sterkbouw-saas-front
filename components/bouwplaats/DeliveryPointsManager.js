import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Checkbox, Card, Button, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDatabase } from '../hooks/useDatabase';
import { format } from 'date-fns';

const DeliveryPointsManager = ({ projectId }) => {
const { executeQuery, executeNonQuery } = useDatabase();
const [deliveries, setDeliveries] = useState([]);
const [filter, setFilter] = useState('pending');

useEffect(() => {
loadDeliveries();
}, [projectId, filter]);

const loadDeliveries = async () => {
let query = SELECT d.*, s.name AS supplier_name, p.name AS project_name FROM deliveries d LEFT JOIN suppliers s ON d.supplier_id = s.id WHERE d.project_id = ?;
if (filter === 'pending') query += " AND d.status = 'pending'";
if (filter === 'delivered') query += " AND d.status = 'delivered'";
query += " ORDER BY d.scheduled_date DESC";

text
const result = await executeQuery(query, [projectId]);
setDeliveries(result);
};

const markAsDelivered = async (id) => {
Alert.alert(
"Mark as Delivered",
"Confirm delivery completion?",
[
{ text: "Cancel", style: "cancel" },
{
text: "Confirm",
onPress: async () => {
await executeNonQuery(
"UPDATE deliveries SET status = 'delivered', actual_date = ? WHERE id = ?",
[new Date().toISOString(), id]
);
loadDeliveries();
}
}
]
);
};

const renderItem = ({ item }) => (
<Card style={styles.card}>
<Card.Content>
<View style={styles.cardHeader}>
<Text style={styles.title}>{item.material_name}</Text>
<Text style={[styles.status, item.status === 'delivered' ? styles.delivered : styles.pending]}>
{item.status}
</Text>
</View>
<Text style={styles.supplier}>Supplier: {item.supplier_name}</Text>
<Text style={styles.text}>Quantity: {item.quantity} {item.unit}</Text>
<Text style={styles.text}>Scheduled: {format(new Date(item.scheduled_date), 'dd-MM-yyyy HH:mm')}</Text>
{item.actual_date && (
<Text style={styles.text}>Delivered: {format(new Date(item.actual_date), 'dd-MM-yyyy HH:mm')}</Text>
)}
<Text style={styles.text}>Location: {item.location}</Text>
{item.status === 'pending' && (
<Button mode="contained" onPress={() => markAsDelivered(item.id)} style={styles.button}>
Mark Delivered
</Button>
)}
</Card.Content>
</Card>
);

return (
<View style={styles.container}>
<View style={styles.filterContainer}>
<TouchableOpacity
style={[styles.filterButton, filter === 'pending' && styles.filterActive]}
onPress={() => setFilter('pending')}
>
<Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Pending</Text>
</TouchableOpacity>
<TouchableOpacity
style={[styles.filterButton, filter === 'delivered' && styles.filterActive]}
onPress={() => setFilter('delivered')}
>
<Text style={[styles.filterText, filter === 'delivered' && styles.filterTextActive]}>Delivered</Text>
</TouchableOpacity>
<TouchableOpacity
style={[styles.filterButton, filter === 'all' && styles.filterActive]}
onPress={() => setFilter('all')}
>
<Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
</TouchableOpacity>
</View>

text
  <FlatList
    data={deliveries}
    renderItem={renderItem}
    keyExtractor={item => item.id.toString()}
    contentContainerStyle={styles.list}
    ListEmptyComponent={
      <View style={styles.emptyContainer}>
        <Icon name="truck-delivery" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No deliveries found</Text>
      </View>
    }
  />
</View>
);
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#f5f5f5' },
filterContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
filterButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 5 },
filterActive: { backgroundColor: '#2196F3' },
filterText: { color: '#666', fontWeight: '500' },
filterTextActive: { color: '#fff' },
list: { padding: 10 },
card: { marginBottom: 10, elevation: 2 },
cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
status: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
pending: { backgroundColor: '#FFEAA7', color: '#E17055' },
delivered: { backgroundColor: '#A3E4D7', color: '#1A5276' },
supplier: { color: '#666', marginBottom: 3 },
text: { color: '#666', marginBottom: 3, fontSize: 12 },
button: { marginTop: 10 },
emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
});

export default DeliveryPointsManager;
