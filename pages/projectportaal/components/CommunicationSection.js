import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/CommunicationSection.module.css';

const CommunicationSection = ({ data }) => {
const [messages, setMessages] = useState(data.messages || []);
const [newMessage, setNewMessage] = useState('');
const [recipient, setRecipient] = useState('');
const messagesEndRef = useRef(null);

text
useEffect(() => {
    scrollToBottom();
}, [messages]);

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

const sendMessage = () => {
    if (newMessage.trim() && recipient) {
        const message = {
            id: Date.now(),
            text: newMessage,
            sender: 'Jij',
            recipient,
            timestamp: new Date().toISOString(),
            attachments: []
        };
        setMessages(prev => [...prev, message]);
        setNewMessage('');
    }
};

const addAttachment = (e) => {
    const files = e.target.files;
    // Handle file attachments here
    console.log('Files to attach:', files);
};

return (
    <div className={styles.container}>
        <h2>Communicatie</h2>
        <div className={styles.communicationWrapper}>
            <div className={styles.contactsPanel}>
                <h3>Contactpersonen</h3>
                <ul className={styles.contactList}>
                    <li onClick={() => setRecipient('Opdrachtgever')}>Opdrachtgever</li>
                    <li onClick={() => setRecipient('Uitvoerder')}>Uitvoerder</li>
                    <li onClick={() => setRecipient('Architect')}>Architect</li>
                    <li onClick={() => setRecipient('Team')}>Team</li>
                </ul>
            </div>

            <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                    <h3>Gesprek met: {recipient || 'Selecteer een contact'}</h3>
                </div>

                <div className={styles.messagesContainer}>
                    {messages
                        .filter(msg => msg.recipient === recipient || msg.sender === recipient)
                        .map((message) => (
                            <div
                                key={message.id}
                                className={`${styles.message} ${message.sender === 'Jij' ? styles.sent : styles.received}`}
                            >
                                <div className={styles.messageHeader}>
                                    <strong>{message.sender}</strong>
                                    <span className={styles.timestamp}>
                                        {new Date(message.timestamp).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                                <div className={styles.messageBody}>
                                    {message.text}
                                </div>
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className={styles.attachments}>
                                        {message.attachments.map((att, idx) => (
                                            <span key={idx} className={styles.attachment}>📎 {att.name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    <div ref={messagesEndRef} />
                </div>

                {recipient && (
                    <div className={styles.messageInput}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Typ je bericht hier..."
                            rows={2}
                        />
                        <div className={styles.inputActions}>
                            <label className={styles.attachButton}>
                                📎 Bijlage
                                <input
                                    type="file"
                                    multiple
                                    onChange={addAttachment}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button 
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className={styles.sendButton}
                            >
                                Versturen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);
};

export default CommunicationSection;
