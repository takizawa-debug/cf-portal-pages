export const printStyles = `
@page {
  size: A4 portrait;
  margin: 15mm;
}

body {
  font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
  color: #333;
  margin: 0;
  padding: 0;
  background-color: #fff;
  line-height: 1.5;
  font-size: 11pt;
}

@media screen {
  body {
    background-color: #f0f0f0;
    padding: 20px;
    display: flex;
    justify-content: center;
  }
  .print-page {
    background-color: white;
    width: 210mm;
    min-height: 297mm;
    padding: 15mm;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }
  .print-btn-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }
  .print-btn {
    background-color: #cf3a3a;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  }
  .print-btn:hover {
    background-color: #a82e2e;
  }
}

@media print {
  .print-btn-container {
    display: none !important;
  }
  .print-page {
    box-shadow: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }
}

.doc-title {
  text-align: center;
  font-size: 18pt;
  font-weight: bold;
  margin-bottom: 5mm;
  border-bottom: 2px solid #333;
  padding-bottom: 5mm;
}

.doc-info {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5mm;
  font-size: 10pt;
}

.section-title {
  font-size: 14pt;
  font-weight: bold;
  margin-top: 8mm;
  margin-bottom: 4mm;
  padding-left: 10px;
  border-left: 4px solid #cf3a3a;
  color: #5b3a1e;
}

.field-row {
  display: flex;
  margin-bottom: 6mm;
  page-break-inside: avoid;
}

.field-label {
  flex: 0 0 40mm;
  font-weight: bold;
  font-size: 10pt;
  padding-top: 2mm;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.badge-req {
  background-color: #cf3a3a;
  color: white;
  font-size: 8pt;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
}

.badge-opt {
  background-color: #999;
  color: white;
  font-size: 8pt;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
}

.field-input {
  flex: 1;
}

.input-box {
  border: 1px solid #999;
  border-radius: 4px;
  width: 100%;
  min-height: 8mm;
  padding: 2mm;
  box-sizing: border-box;
}

.input-box.textarea {
  min-height: 25mm;
}

.input-box.textarea-large {
  min-height: 40mm;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4mm;
  margin-top: 2mm;
}

.checkbox-group {
  grid-column: 1 / -1; /* Make grouped categories span full width */
  margin-bottom: 4mm;
}

.sub-category-list {
  font-size: 8.5pt;
  color: #555;
  margin-left: 6mm;
  margin-top: 1mm;
  line-height: 1.4;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 2mm;
  font-size: 10pt;
}

.checkbox-box {
  width: 4mm;
  height: 4mm;
  border: 1px solid #666;
  border-radius: 2px;
  display: inline-block;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 2mm;
  font-size: 10pt;
}

.radio-circle {
  width: 4mm;
  height: 4mm;
  border: 1px solid #666;
  border-radius: 50%;
  display: inline-block;
}

.multi-input-row {
  display: flex;
  gap: 4mm;
  align-items: center;
}

.multi-input-row .input-box {
  flex: 1;
}

.time-dash {
  margin: 0 2mm;
}

.sub-text {
  font-size: 8pt;
  color: #666;
  margin-top: 1mm;
}

.page-break {
  page-break-before: always;
}

.private-boundary {
  margin-top: 10mm;
  border-top: 2px dashed #999;
  padding-top: 5mm;
  position: relative;
}
.private-label {
  position: absolute;
  top: -12px;
  background: white;
  padding: 0 10px;
  color: #999;
  font-size: 9pt;
  font-weight: bold;
}
`;
