import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, List, notification, message } from 'antd';
import axios from 'axios';
import moment from 'moment';    
import './style.css'

const { Item } = Form;

const ReminderApp = () => {
    const [reminders, setReminders] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        // Fetch reminders from API
        axios.get('http://localhost:4001/data').then(response => {
            setReminders(response.data);
        });
    }, []);

    const handleSubmit = values => {
        const newReminder = { ...values, date: values.date.format('YYYY-MM-DD') };

        // Check for duplicate date or content
        const isDuplicate = reminders.some(reminder =>
            reminder.date === newReminder.date || reminder.content === newReminder.content
        );

        if (isDuplicate) {
            message.error('Ngày hoặc nội dung nhắc nhở đã tồn tại.');
            return;
        }

        axios.post('http://localhost:4001/data', newReminder).then(response => {
            setReminders([...reminders, response.data]);
            form.resetFields();
        });
    };

    const handleDelete = id => {
        axios.delete(`http://localhost:4001/data/${id}`).then(() => {
            setReminders(reminders.filter(reminder => reminder.id !== id));
        });
    };

    const handleAlert = () => {
        reminders.forEach(reminder => {
            if (moment().isSame(reminder.date, 'day')) {
                notification.open({
                    message: 'Nhắc nhở',
                    description: reminder.content,
                });
            }
        });
    };

    useEffect(() => {
        handleAlert();
    }, [reminders]);

    return (
        <>
            <h1>NHẮC NHỞ NGÀY QUAN TRỌNG CỦA BẠN</h1>
            <div className='remind'>
                <Form form={form} onFinish={handleSubmit}>
                    <Item name="content" rules={[{ required: true, message: 'Bạn chưa nhập nội dung' }]}>
                        <Input placeholder="Nhập nội dung của ngày" />
                    </Item>
                    <div className='d-flex'>
                        <Item name="date" rules={[{ required: true, message: 'Bạn chưa chọn ngày nhắc' }]}>
                            <DatePicker disabledDate={current => current && current < moment().startOf('day')} />
                        </Item>
                        <Button type="primary" htmlType="submit">
                            Lưu Ngày
                        </Button>
                    </div>
                </Form>
                <List className='list'
                    dataSource={reminders}
                    renderItem={item => (
                        <List.Item className='list-item'
                            actions={[
                                <Button type="link" onClick={() => handleDelete(item.id)}>
                                    Xóa
                                </Button>,
                            ]}
                            style={{ backgroundColor: moment().isSame(item.date, 'day') ? 'red' : 'white' }}
                        >
                            {item.content} - {item.date}
                        </List.Item>
                    )}
                />
            </div>
        </>
    );
};

export default ReminderApp;
