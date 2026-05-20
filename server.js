/**
 * 數位發展部 防災積木元件創新賽 核心實作
 * 元件型態：事件處理型元件 (Event-driven Component) / Mock API 元件
 */

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public')); // 靜態託管前端 UI

// 📥 [Input 格式定義]：系統預期接收之 JSON Schema 結構明細
/*
{
  "report_id": "string (去識別化亂數)",
  "sequence": "integer (增量序號)",
  "timestamp": "long (Unix時間戳)",
  "status": "string (事件狀態碼)",
  "location": { "latitude": "float", "longitude": "float" },
  "payload": "object (可變動之沙盒擴充動態欄位)"
}
*/

// 儲存於記憶體中，模擬落庫與聚合分析之暫存器 (DPI 公共資料流模擬)
const memoryDatabase = {};

app.post('/api/report/stream', (req, res) => {
    // [Process 處理邏輯]
    const { report_id, sequence, timestamp, status, location, payload } = req.body;

    // 1. 基礎防禦性驗證 (防範規格不符之不合規惡作劇請求)
    if (!report_id || !sequence || !status || !location) {
        return res.status(400).json({ 
            status: "ERROR", 
            code: 400,
            message: "Input格式不符簡章 JSON Schema 規範規格" 
        });
    }

    console.log(`\n📥 [Process 處理中] 收到去識別化封包 ID: ${report_id} (序號: ${sequence})`);

    // 2. 碎形資料疊加邏輯 (UPSERT 核心運作機制)
    if (!memoryDatabase[report_id]) {
        // 首次 Commit：建立核心錨點（去識別化座標與初始狀態）
        memoryDatabase[report_id] = {
            report_id: report_id,
            initial_timestamp: timestamp,
            latest_update: timestamp,
            latest_status: status,
            latitude: location.latitude,
            longitude: location.longitude,
            accumulated_intel: {}
        };
        console.log(`📍 [位置鎖定] 已成功為新通報事件建立地理格點.`);
    } else {
        // 後續 Commit：更新動態狀態與疊加沙盒資料
        memoryDatabase[report_id].latest_status = status;
        memoryDatabase[report_id].latest_update = timestamp;
    }

    // 將隨本次碎形封包傳入的個別問答資料，揉進大數據整合物件中
    if (payload && Object.keys(payload).length > 0) {
        Object.assign(memoryDatabase[report_id].accumulated_intel, payload);
        console.log(`🧩 [情資疊加成功] 目前已累積資料:`, memoryDatabase[report_id].accumulated_intel);
    }

    // 📤 [Output 輸出規格]：符合簡章之標準 Open Data 格式輸出
    const outputResponse = {
        status: "SUCCESS",
        server_ack_timestamp: Math.floor(Date.now() / 1000),
        processed_sequence: sequence,
        registered_id: report_id,
        current_snapshot: memoryDatabase[report_id]
    };

    return res.status(200).json(outputResponse);
});

// 開放對外讀取接口，實踐簡章「得提供其他系統/決策系統讀取及使用」之共享宗旨
app.get('/api/report/export', (req, res) => {
    res.status(200).json({
        component_type: "Event-driven Open Stream",
        total_active_incidents: Object.keys(memoryDatabase).length,
        records: Object.values(memoryDatabase)
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 防災積木核心元件已在通訊埠 ${PORT} 成功運作模擬中`);
    console.log(`🔗 測試介面: http://localhost:${PORT}`);
    console.log(`📊 共享資料庫讀取接口: http://localhost:${PORT}/api/report/export`);
    console.log(`================================================================`);
});
