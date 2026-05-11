-- AddIndex: Material (companyId, qrCode)
-- Otimiza o scan de checklist via QR Code, que sempre filtra por empresa.
-- Reduz de full-scan + filter para index lookup direto (~50ms → <5ms).

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Material_companyId_qrCode_idx"
  ON "Material" ("companyId", "qrCode");
