// =============================================
// Read-only Order View (inline, full-screen)
// Displays order details and photos in read-only mode
// Rendered inline like the edit form — not a Modal overlay
// =============================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { WorkOrder, PHOTO_SLOT_LABELS } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDate, getStatusLabel } from '../utils/formatters';

interface OrderViewProps {
  order: WorkOrder;
  onClose: () => void;
  onEdit: () => void;
}

export function OrderView({ order, onClose, onEdit }: OrderViewProps) {
  const insets = useSafeAreaInsets();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoScale, setPhotoScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const touchStartDistanceRef = useRef(0);
  const scaleAtStartRef = useRef(1);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const panStartXRef = useRef(0);
  const panStartYRef = useRef(0);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePhotoTouchStart = (evt: any) => {
    const { touches } = evt.nativeEvent;
    if (touches.length === 2) {
      // Pinch gesture
      const distance = calculateDistance(
        touches[0].pageX,
        touches[0].pageY,
        touches[1].pageX,
        touches[1].pageY
      );
      touchStartDistanceRef.current = distance;
      scaleAtStartRef.current = photoScale;
    } else if (touches.length === 1 && photoScale > 1) {
      // Pan gesture (only when zoomed)
      touchStartXRef.current = touches[0].pageX;
      touchStartYRef.current = touches[0].pageY;
      panStartXRef.current = panX;
      panStartYRef.current = panY;
    }
  };

  const handlePhotoTouchMove = (evt: any) => {
    const { touches } = evt.nativeEvent;
    if (touches.length === 2 && touchStartDistanceRef.current > 0) {
      // Pinch zoom
      const distance = calculateDistance(
        touches[0].pageX,
        touches[0].pageY,
        touches[1].pageX,
        touches[1].pageY
      );
      const scaleFactor = distance / touchStartDistanceRef.current;
      let newScale = scaleAtStartRef.current * scaleFactor;
      newScale = Math.max(1, Math.min(newScale, 5));
      setPhotoScale(newScale);
    } else if (touches.length === 1 && photoScale > 1 && touchStartXRef.current > 0) {
      // Pan/drag - adjust movement to match finger speed
      const deltaX = (touches[0].pageX - touchStartXRef.current) / photoScale;
      const deltaY = (touches[0].pageY - touchStartYRef.current) / photoScale;

      const maxPan = (Dimensions.get('window').width / 2) * (photoScale - 1);
      const newPanX = Math.max(-maxPan, Math.min(maxPan, panStartXRef.current + deltaX));
      const newPanY = Math.max(-maxPan, Math.min(maxPan, panStartYRef.current + deltaY));

      setPanX(newPanX);
      setPanY(newPanY);
    }
  };

  const handlePhotoTouchEnd = () => {
    touchStartDistanceRef.current = 0;
    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
  };

  const handlePhotoModalClose = () => {
    setPhotoModalVisible(false);
    setPhotoScale(1);
    setPanX(0);
    setPanY(0);
    touchStartDistanceRef.current = 0;
  };

  const completedPhotos = order.photos.filter((p) => p.uri).length;
  const totalPhotos = order.photos.length;

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: SPACING.lg + insets.top }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderTitle}>OT #{order.id}</Text>
            <Text style={styles.createdDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.headerRight}>
            <StatusBadge status={order.status} />
            <TouchableOpacity
              onPress={() => {
                onClose();
                onEdit();
              }}
              style={styles.editIconButton}
            >
              <Ionicons name="pencil" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Client Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person" size={18} color={COLORS.accent} /> Cliente
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{order.clientName || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{order.clientPhone || 'N/A'}</Text>
            </View>
          </View>

          {/* Vehicle Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="car" size={18} color={COLORS.accent} /> Vehículo
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Placas:</Text>
              <Text style={styles.value}>{order.vehicle.plates || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>VIN:</Text>
              <Text style={styles.value}>{order.vehicle.vin || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Marca/Modelo:</Text>
              <Text style={styles.value}>
                {order.vehicle.brand && order.vehicle.model
                  ? `${order.vehicle.brand} ${order.vehicle.model}`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Año:</Text>
              <Text style={styles.value}>{order.vehicle.year || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Color:</Text>
              <Text style={styles.value}>{order.vehicle.color || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Motor:</Text>
              <Text style={styles.value}>{order.vehicle.engine || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Odómetro:</Text>
              <Text style={styles.value}>{order.vehicle.odometer || 'N/A'} km</Text>
            </View>
          </View>

          {/* Reason for Visit */}
          {order.reasonForVisit ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="document-text" size={18} color={COLORS.accent} /> Motivo de Ingreso
              </Text>
              <Text style={styles.reasonText}>{order.reasonForVisit}</Text>
            </View>
          ) : null}

          {/* Inspection Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="camera" size={18} color={COLORS.accent} /> Fotos de Inspección ({completedPhotos}/{totalPhotos})
            </Text>
            <View style={styles.photoGrid}>
              {order.photos.map((photo) => (
                <TouchableOpacity
                  key={photo.slot}
                  style={styles.photoGridItem}
                  onPress={() => {
                    if (photo.uri) {
                      setSelectedPhoto(photo.uri);
                      setPhotoModalVisible(true);
                    }
                  }}
                >
                  {photo.uri ? (
                    <>
                      <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                      <View style={styles.photoLabel}>
                        <Text style={styles.photoSlotName}>{PHOTO_SLOT_LABELS[photo.slot]}</Text>
                      </View>
                    </>
                  ) : (
                    <View style={[styles.photoThumbnail, styles.photoPlaceholder]}>
                      <Ionicons name="image-outline" size={24} color={COLORS.textLight} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Task Summary */}
          {order.tasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="list" size={18} color={COLORS.accent} /> Tareas ({order.tasks.length})
              </Text>
              {order.tasks.map((task, idx) => (
                <View key={task.id} style={styles.taskItem}>
                  <Text style={styles.taskNumber}>{idx + 1}.</Text>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskDescription}>{task.description || 'Sin descripción'}</Text>
                    <Text style={styles.taskMeta}>{getStatusLabel(task.status)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      {/* Photo Preview Modal with Zoom Support */}
      <Modal visible={photoModalVisible} animationType="fade" transparent={true}>
        <View style={styles.photoModalContainer}>
          <View
            style={styles.photoModalBackdropScroll}
            onTouchStart={handlePhotoTouchStart}
            onTouchMove={handlePhotoTouchMove}
            onTouchEnd={handlePhotoTouchEnd}
          >
            <View style={styles.photoModalContent}>
              {selectedPhoto && (
                <Image
                  source={{ uri: selectedPhoto }}
                  style={[styles.fullPhoto, { transform: [{ scale: photoScale }, { translateX: panX }, { translateY: panY }] }]}
                />
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.photoCloseButton}
            onPress={handlePhotoModalClose}
          >
            <Ionicons name="close-circle" size={40} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  orderTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  createdDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  editIconButton: {
    padding: SPACING.xs,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl + 60,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 100,
  },
  value: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoGridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  photoPlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: SPACING.xs,
  },
  photoSlotName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  taskNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.accent,
    marginRight: SPACING.sm,
    minWidth: 24,
  },
  taskContent: {
    flex: 1,
  },
  taskDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  taskMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalBackdropScroll: {
    flex: 1,
  },
  photoModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPhoto: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    resizeMode: 'contain',
  },
  photoCloseButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
  },
});
