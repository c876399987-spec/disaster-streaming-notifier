-- 🧬 數位發展部 防災積木創新賽：關聯式去識別化資料庫架構書 (PostgreSQL/SQLite 通用)

CREATE TABLE IF NOT EXISTS disaster_reports (
    -- 核心主鍵：去識別化隨機事件 ID，保障個資免責，加快索引傳輸速度
    report_id VARCHAR(50) PRIMARY KEY,
    
    -- 元件狀態快照，儲存最新流轉狀態碼 (例如: A_SOS_SCALE, B_INTEL_TREND_FINAL)
    latest_status VARCHAR(50) NOT NULL,
    
    -- 精準去識別化 GIS 空間座標，直接對接內政部與 NCDR 地理決策系統
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    
    -- 💡 [核心元件創新]: 碎形增量沙盒儲存槽
    -- 使用 JSONB 標準二進位格式存放民眾所有「跳過題」或「回答題」的動態累加數據
    -- 此架構具備「無限擴充性」，未來新增任何問答都不需進行資料庫變更（Schema Alteration）
    accumulated_intel JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ⚡ [大數據高效索引優化]: 確保數十萬人湧入時，後台分析元件能進行秒級的「風險區域群聚(Clustering)分析」
CREATE INDEX IF NOT EXISTS idx_reports_gis ON disaster_reports (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_status ON disaster_reports (latest_status);
