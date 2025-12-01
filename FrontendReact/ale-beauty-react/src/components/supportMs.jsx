import React, { useEffect, useState } from 'react';
import "../assets/stylesheets/SupportMs.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import PinterestIcon from "@mui/icons-material/Pinterest";
import { useTranslation } from "react-i18next";

export default function SupportMs() {
    const { t } = useTranslation();

    const [orders, setOrders] = useState([]);
    const [orderId, setOrderId] = useState("");
    const [loadingOrders, setloadingOrders] = useState(true);
    const [message_text, setMessageText] = useState("");
    const token = localStorage.getItem("token");

    // Cargar órdenes
    useEffect(() => {
        fetch("https://localhost:4000/api/v1/my_orders", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                } else if (Array.isArray(data.orders)) {
                    setOrders(data.orders);
                } else {
                    setOrders([]);
                }
            })
            .catch(err => console.error(t('supportForm.orderFetchError'), err))
            .finally(() => setloadingOrders(false));
    }, [token, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!orderId) {
            alert(t('supportForm.selectOrderAlert'));
            return;
        }
        if (!message_text.trim()) {
            alert(t('supportForm.messageRequiredAlert'));
            return;
        }
        const payload = {
            support_message: {
                order_id: Number(orderId),
                message_text
            }
        };

        const res = await fetch("https://localhost:4000/api/v1/support_messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        alert(data.message || t('supportForm.sentSuccess'));
    };

    return (
        <div className="support-container">
            {/* Left side info */}
            <div className="support-info">
                <h1 className="title-touch">{t('supportForm.contactTitle')}</h1>
                <p className="subtitle-touch" style={{ width: "500px", marginLeft: "15px", color: "#a9a9a9", fontWeight: "bold" }}>
                    {t('supportForm.contactSubtitle')}
                </p>
                <article className='email-number' style={{ display: "flex", gap: 150 }}>
                    <div className="info-block">
                        <p className="label">{t('supportForm.email')}</p>
                        <p className="value">soporte.alebeauty@gmail.com</p>
                    </div>
                    <div className="info-block">
                        <p className="label">{t('supportForm.phone')}</p>
                        <p className="value">+57 302 2880520</p>
                    </div>
                </article>
                <div className="info-block">
                    <p className="label">{t('supportForm.address')}</p>
                    <p className="value" style={{ width: "500px" }}>
                        Atlantico, Rebolo, Cra 29 #17-17 <br />
                        Colombia
                    </p>
                </div>
            </div>

            {/* Right side form */}
            <div className="support-form-container">
                <form className="support-form" onSubmit={handleSubmit}>
                    <select
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="full-width"
                        style={{ background: "#f8f9f9", height: 45, border: "none", borderRadius: 10, padding: 9 }}
                    >
                        <option value="">{t('supportForm.selectOrderOption')}</option>
                        {orders.map(order => (
                            <option key={order.id} value={order.id}>
                                {order.numero_de_orden} — {order.status}
                            </option>
                        ))}
                    </select>
                    <textarea
                        placeholder={t('supportForm.messagePlaceholder')}
                        value={message_text}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows="10"
                        minLength={20}
                        maxLength={500}
                        style={{ background: "#f8f9f9" }}
                    ></textarea>
                    <button type="submit" className="send-btn">
                        {t('supportForm.sendButton')}
                    </button>
                </form>
            </div>
        </div>
    );
}