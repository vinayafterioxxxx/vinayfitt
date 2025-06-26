import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X, Camera, Image as ImageIcon, Grid3x3 as Grid3X3, List, Calendar, Weight, Percent, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface ProgressPhoto {
  id: string;
  imageUri: string;
  weight?: number;
  bodyFat?: number;
  date: string;
  tags?: string[];
}

export default function ProgressPhotoScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);

  const [photos, setPhotos] = useState<ProgressPhoto[]>([
    {
      id: '1',
      imageUri: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
      weight: 69.5,
      bodyFat: 15,
      date: '2025-06-03',
      tags: ['front']
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  
  // Form states
  const [newPhoto, setNewPhoto] = useState<Partial<ProgressPhoto>>({
    weight: undefined,
    bodyFat: undefined,
    date: new Date().toISOString().split('T')[0],
    tags: []
  });
  const [tempImageUri, setTempImageUri] = useState<string>('');
  const [newTag, setNewTag] = useState('');

  // Camera states
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleAddPhoto = () => {
    setShowAddModal(true);
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      // For web, use a placeholder image
      setTempImageUri('https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg');
      setShowCameraModal(false);
      setShowPhotoModal(true);
    } else {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('Permission required', 'Camera permission is needed to take photos');
          return;
        }
      }
      setShowCameraModal(true);
    }
  };

  const handleOpenAlbum = () => {
    // For demo purposes, use a placeholder image
    setTempImageUri('https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg');
    setShowAddModal(false);
    setShowPhotoModal(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setTempImageUri(photo.uri);
          setShowCameraModal(false);
          setShowPhotoModal(true);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const handleSavePhoto = () => {
    if (!tempImageUri) return;

    const newPhotoData: ProgressPhoto = {
      id: Date.now().toString(),
      imageUri: tempImageUri,
      weight: newPhoto.weight,
      bodyFat: newPhoto.bodyFat,
      date: newPhoto.date || new Date().toISOString().split('T')[0],
      tags: newPhoto.tags || []
    };

    setPhotos(prev => [newPhotoData, ...prev]);
    
    // Reset form
    setNewPhoto({
      weight: undefined,
      bodyFat: undefined,
      date: new Date().toISOString().split('T')[0],
      tags: []
    });
    setTempImageUri('');
    setShowPhotoModal(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && newPhoto.tags && !newPhoto.tags.includes(newTag.trim())) {
      setNewPhoto(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPhoto(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {photos.map((photo, index) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.gridItem}
          onPress={() => setSelectedPhoto(photo)}
        >
          <Image source={{ uri: photo.imageUri }} style={styles.gridImage} />
          <View style={styles.gridOverlay}>
            <Text style={styles.gridDate}>
              {new Date(photo.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {photos.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.listItem}
          onPress={() => setSelectedPhoto(photo)}
        >
          <Image source={{ uri: photo.imageUri }} style={styles.listImage} />
          <View style={styles.listContent}>
            <Text style={styles.listDate}>
              {new Date(photo.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <View style={styles.listMetrics}>
              {photo.weight && (
                <Text style={styles.listMetric}>Weight: {photo.weight} kg</Text>
              )}
              {photo.bodyFat && (
                <Text style={styles.listMetric}>Body Fat: {photo.bodyFat}%</Text>
              )}
            </View>
            {photo.tags && photo.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {photo.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Progress Photo</Text>
        <TouchableOpacity onPress={handleAddPhoto} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
          onPress={() => setViewMode('grid')}
        >
          <Grid3X3 size={20} color={viewMode === 'grid' ? colors.surface : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
          onPress={() => setViewMode('list')}
        >
          <List size={20} color={viewMode === 'list' ? colors.surface : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'grid' ? renderGridView() : renderListView()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Photo Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Add photo</Text>
          <Text style={styles.modalSubtitle}>Select from one of the options below</Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleTakePhoto}>
              <Text style={styles.modalButtonText}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleOpenAlbum}>
              <Text style={styles.modalButtonText}>Open album</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            >
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setShowCameraModal(false)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={capturePhoto}
                />
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
                >
                  <Camera size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>Camera permission required</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Photo Details Modal */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <SafeAreaView style={styles.photoModalContainer}>
          <View style={styles.photoModalHeader}>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.photoModalTitle}>Progress Photo</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.photoModalContent}>
            {/* Photo Preview */}
            <View style={styles.photoPreview}>
              <Image source={{ uri: tempImageUri }} style={styles.previewImage} />
              <View style={styles.photoOverlay}>
                <TouchableOpacity style={styles.addTagButton}>
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.addTagText}>Add tag</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closePhotoButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Weight</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={newPhoto.weight?.toString() || ''}
                    onChangeText={(text) => setNewPhoto(prev => ({ ...prev, weight: parseFloat(text) || undefined }))}
                    placeholder="Enter weight"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputSuffix}>kg</Text>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Body Fat</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={newPhoto.bodyFat?.toString() || ''}
                    onChangeText={(text) => setNewPhoto(prev => ({ ...prev, bodyFat: parseFloat(text) || undefined }))}
                    placeholder="Enter body fat"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputSuffix}>%</Text>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={newPhoto.date || ''}
                  onChangeText={(text) => setNewPhoto(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Tags */}
              {newPhoto.tags && newPhoto.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.fieldLabel}>Tags</Text>
                  <View style={styles.tagContainer}>
                    {newPhoto.tags.map((tag, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.editableTag}
                        onPress={() => handleRemoveTag(tag)}
                      >
                        <Text style={styles.editableTagText}>{tag}</Text>
                        <X size={12} color={colors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePhoto}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Photo Detail View Modal */}
      <Modal
        visible={!!selectedPhoto}
        animationType="slide"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.detailTitle}>Progress Photo</Text>
              <TouchableOpacity>
                <MoreHorizontal size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailContent}>
              <Image source={{ uri: selectedPhoto.imageUri }} style={styles.detailImage} />
              
              <View style={styles.detailInfo}>
                <Text style={styles.detailDate}>
                  {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                
                {(selectedPhoto.weight || selectedPhoto.bodyFat) && (
                  <View style={styles.detailMetrics}>
                    {selectedPhoto.weight && (
                      <View style={styles.detailMetric}>
                        <Weight size={16} color={colors.textSecondary} />
                        <Text style={styles.detailMetricText}>{selectedPhoto.weight} kg</Text>
                      </View>
                    )}
                    {selectedPhoto.bodyFat && (
                      <View style={styles.detailMetric}>
                        <Percent size={16} color={colors.textSecondary} />
                        <Text style={styles.detailMetricText}>{selectedPhoto.bodyFat}%</Text>
                      </View>
                    )}
                  </View>
                )}

                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <View style={styles.detailTags}>
                    {selectedPhoto.tags.map((tag, index) => (
                      <View key={index} style={styles.detailTag}>
                        <Text style={styles.detailTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
  },
  addButton: {
    padding: 4,
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItem: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  gridDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  listContent: {
    flex: 1,
  },
  listDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  listMetrics: {
    marginBottom: 8,
  },
  listMetric: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  modalButtons: {
    gap: 16,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  permissionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  permissionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  photoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  photoModalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
  },
  photoModalContent: {
    flex: 1,
  },
  photoPreview: {
    height: 300,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  closePhotoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  formField: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  inputSuffix: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
  },
  dateInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tagsSection: {
    marginTop: 8,
  },
  editableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  editableTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.primary,
    marginRight: 4,
  },
  saveButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
  },
  detailContent: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 400,
  },
  detailInfo: {
    padding: 20,
  },
  detailDate: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
  },
  detailMetrics: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  detailMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailMetricText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  detailTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.primary,
  },
});