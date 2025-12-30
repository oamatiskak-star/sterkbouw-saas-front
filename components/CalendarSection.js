// components/CalendarSection.js
import React from 'react';
import { Card, Calendar, Badge, List, Tag } from 'antd';
import dayjs from 'dayjs';

const CalendarSection = () => {
  const getListData = (value) => {
    const events = {
      '2024-02-20': [
        { type: 'success', content: 'Contract review meeting' },
        { type: 'warning', content: 'Deadline: Project proposal' },
      ],
      '2024-02-22': [
        { type: 'error', content: 'Site inspection' },
      ],
      '2024-02-25': [
        { type: 'processing', content: 'Client presentation' },
      ],
    };
    
    return events[value.format('YYYY-MM-DD')] || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <List
        size="small"
        dataSource={listData.slice(0, 2)}
        renderItem={(item) => (
          <List.Item>
            <Badge status={item.type} text={item.content} />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div>
      <Card title="Project Kalender">
        <Calendar dateCellRender={dateCellRender} />
        
        <div style={{ marginTop: 24 }}>
          <h4>Legenda</h4>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <Badge status="success" text="Meeting" />
            <Badge status="warning" text="Deadline" />
            <Badge status="error" text="Inspectie" />
            <Badge status="processing" text="Presentatie" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarSection;
