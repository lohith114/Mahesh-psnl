import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
  Card,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";

function ExamTimeTable() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const savedExamPdf = localStorage.getItem("examPdfUrl");
    if (savedExamPdf) {
      setPdfUrl(savedExamPdf);
      setSuccess(true);
    }
  }, []);

  useEffect(() => {
    if (pdfUrl) {
      localStorage.setItem("examPdfUrl", pdfUrl);
    } else {
      localStorage.removeItem("examPdfUrl");
    }
  }, [pdfUrl]);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
    setProgress(0);
    setSuccess(false);
  };

  const onFileUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    axios
      .post("http://localhost:5000/upload-exam", formData, {
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      })
      .then((response) => {
        setPdfUrl(response.data.url);
        setLoading(false);
        setSuccess(true);
      })
      .catch((error) => {
        console.error("Error uploading exam timetable:", error);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    axios
      .delete("http://localhost:5000/delete-exam")
      .then(() => {
        setPdfUrl(null);
        setSuccess(false);
      })
      .catch((error) => {
        console.error("Error deleting exam timetable:", error);
      });
    setOpenDeleteDialog(false);
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f5f5" }}>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Exam Timetable
        </Typography>

        <Box>
          <input type="file" onChange={onFileChange} />
          <Button
            variant="contained"
            color="primary"
            onClick={onFileUpload}
            disabled={!file || loading}
            sx={{ marginLeft: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </Box>

        {loading && <LinearProgress variant="determinate" value={progress} />}
        {progress > 0 && <Typography>{progress}%</Typography>}
        {success && <Typography color="success.main">File uploaded successfully!</Typography>}
      </Paper>

      {pdfUrl && (
        <Card sx={{ padding: 2, marginBottom: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PictureAsPdfIcon sx={{ fontSize: 40, color: "red", marginRight: 2 }} />
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              Exam Timetable Uploaded
            </Typography>
            <IconButton color="error" onClick={() => setOpenDeleteDialog(true)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Card>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the uploaded exam timetable? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExamTimeTable;
