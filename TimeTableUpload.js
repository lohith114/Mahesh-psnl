import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
  IconButton,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';

const StyledFileDrop = styled(Box)(({ theme, isDragOver }) => ({
  border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.grey[400]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  color: isDragOver ? theme.palette.primary.dark : theme.palette.text.secondary,
  transition: 'background-color 0.3s ease',
  backgroundColor: isDragOver ? theme.palette.action.hover : theme.palette.background.paper,
  cursor: 'pointer',
}));

const PdfContainer = styled(Box)(({ theme, isFullScreen }) => ({
  position: isFullScreen ? 'fixed' : 'relative',
  top: isFullScreen ? 0 : 'auto',
  left: isFullScreen ? 0 : 'auto',
  zIndex: isFullScreen ? 1300 : 'auto',
  background: isFullScreen ? theme.palette.background.default : 'transparent',
  width: isFullScreen ? '100vw' : '100%',
  height: isFullScreen ? '100vh' : '600px',
  padding: theme.spacing(isFullScreen ? 2 : 0),
  overflow: 'hidden',
  borderRadius: isFullScreen ? 0 : theme.shape.borderRadius,
  boxShadow: isFullScreen ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
}));

function TimeTableUpload() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [open, setOpen] = useState(false); // State to control the dialog
  const [openNotification, setOpenNotification] = useState(false); // State for the notification dialog

  useEffect(() => {
    const savedPdfUrl = localStorage.getItem('pdfUrl');
    if (savedPdfUrl) {
      setPdfUrl(savedPdfUrl);
      setSuccess(true);
    }
  }, []);

  useEffect(() => {
    if (pdfUrl) {
      localStorage.setItem('pdfUrl', pdfUrl);
    } else {
      localStorage.removeItem('pdfUrl');
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
    formData.append('file', file);
    setLoading(true);

    axios
      .post('http://localhost:5000/upload', formData, {
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      })
      .then((response) => {
        setPdfUrl(response.data.url);
        setLoading(false);
        setSuccess(true);
        setOpenNotification(true); // Open the notification dialog
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const onDelete = useCallback(() => {
    axios
      .delete('http://localhost:5000/delete')
      .then(() => {
        setPdfUrl(null); // Clear the PDF state
        setSuccess(false);
        setIsFullScreen(false); // Close fullscreen if open
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
      });
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    handleClose();
  };

  const handleNotificationClose = () => {
    setOpenNotification(false);
    setFile(null); // Reset the file input
    setProgress(0);
    setSuccess(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#f5f5f5',
        padding: 4,
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          width: 300,
          textAlign: 'left',
          marginBottom: { xs: 3, md: 0 },
          marginRight: { md: 3 },
        }}
      >
        <Typography variant="h5" gutterBottom>
          Upload File
        </Typography>

        <StyledFileDrop
          isDragOver={isDragOver}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0]);
            setProgress(0);
            setSuccess(false);
            setIsDragOver(false);
          }}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            type="file"
            id="fileInput"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
          {file ? (
            <Typography>{file.name}</Typography>
          ) : (
            <>
              <Typography>Drag & Drop to Upload File</Typography>
              <Typography>OR</Typography>
              <Button variant="contained" size="small" sx={{ mt: 2 }}>
                Browse File
              </Button>
            </>
          )}
        </StyledFileDrop>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={onFileUpload}
          disabled={!file || loading}
        >
          {loading ? <CircularProgress size={20} /> : pdfUrl ? 'Update PDF' : 'Upload PDF'}
        </Button>

        {loading && (
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
        )}
        {progress > 0 && (
          <Typography sx={{ mt: 1 }} align="center">
            {progress}%
          </Typography>
        )}
        {success && (
          <Typography sx={{ mt: 2, color: 'success.main' }} align="center">
            File uploaded successfully!
          </Typography>
        )}
      </Paper>

      {pdfUrl ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 4 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded PDF
          </Typography>
          <Card
            sx={{
              width: 100,
              height: 120,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              border: '2px solid red',
              borderRadius: 2,
              boxShadow: 3,
              mt: 2,
              mb: 2,
              backgroundColor: 'white',
              position: 'relative',
            }}
            onClick={() => setIsFullScreen(true)}
          >
            <PictureAsPdfIcon sx={{ color: 'red', fontSize: 40 }} />
            <Typography variant="body2" sx={{ color: 'black', mt: 1 }}>
              PDF
            </Typography>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                bgcolor: 'white',
                border: '1px solid red',
                ':hover': { bgcolor: 'red', color: 'white' },
              }}
              onClick={handleClickOpen}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Card>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          No file uploaded yet.
        </Typography>
      )}

      {isFullScreen && (
        <PdfContainer isFullScreen={isFullScreen.toString()}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Uploaded PDF</Typography>
            <IconButton color="primary" onClick={() => setIsFullScreen(false)}>
              <CloseFullscreenIcon />
            </IconButton>
          </Box>
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            title="Uploaded PDF"
            style={{
              flex: 1,
              border: 'none',
              overflow: 'auto',
            }}
          />
        </PdfContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the uploaded file? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNotification} onClose={handleNotificationClose}>
        <DialogTitle>Upload Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The file has been uploaded successfully!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotificationClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TimeTableUpload;
 