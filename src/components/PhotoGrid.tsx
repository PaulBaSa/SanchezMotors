import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { InspectionPhoto, PhotoSlot, PHOTO_SLOT_LABELS } from '../types';

interface PhotoGridProps {
  photos: InspectionPhoto[];
  onPhotosChange: (photos: InspectionPhoto[]) => void;
  editable?: boolean;
}

const SLOTS: PhotoSlot[] = [
  'front',
  'rear',
  'left',
  'right',
  'interior_front',
  'interior_rear',
];

export function PhotoGrid({ photos, onPhotosChange, editable = true }: PhotoGridProps) {
  const completedCount = photos.filter((p) => p.uri).length;

  const getPhotoForSlot = (slot: PhotoSlot): InspectionPhoto | undefined => {
    return photos.find((p) => p.slot === slot);
  };

  const handleTakePhoto = async (slot: PhotoSlot) => {
    if (!editable) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesita acceso a la cámara para tomar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: InspectionPhoto = {
        slot,
        uri: result.assets[0].uri,
        note: '',
        timestamp: new Date().toISOString(),
      };

      const updatedPhotos = photos.filter((p) => p.slot !== slot);
      updatedPhotos.push(newPhoto);
      onPhotosChange(updatedPhotos);
    }
  };

  const handlePickPhoto = async (slot: PhotoSlot) => {
    if (!editable) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesita acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: InspectionPhoto = {
        slot,
        uri: result.assets[0].uri,
        note: '',
        timestamp: new Date().toISOString(),
      };

      const updatedPhotos = photos.filter((p) => p.slot !== slot);
      updatedPhotos.push(newPhoto);
      onPhotosChange(updatedPhotos);
    }
  };

  const handleNoteChange = (slot: PhotoSlot, note: string) => {
    const updatedPhotos = photos.map((p) =>
      p.slot === slot ? { ...p, note } : p
    );
    onPhotosChange(updatedPhotos);
  };

  const handlePhotoAction = (slot: PhotoSlot) => {
    Alert.alert('Capturar Foto', `${PHOTO_SLOT_LABELS[slot]}`, [
      { text: 'Cámara', onPress: () => handleTakePhoto(slot) },
      { text: 'Galería', onPress: () => handlePickPhoto(slot) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inspección Visual</Text>
        <Text
          style={[
            styles.counter,
            completedCount === 6 ? styles.counterComplete : styles.counterIncomplete,
          ]}
        >
          {completedCount}/6 fotos
        </Text>
      </View>

      <View style={styles.grid}>
        {SLOTS.map((slot) => {
          const photo = getPhotoForSlot(slot);
          return (
            <View key={slot} style={styles.photoCard}>
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={() => handlePhotoAction(slot)}
                disabled={!editable}
              >
                {photo?.uri ? (
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons
                      name="camera-outline"
                      size={TOUCH_TARGET.iconSizeLg}
                      color={COLORS.textLight}
                    />
                    <Text style={styles.placeholderText}>
                      {PHOTO_SLOT_LABELS[slot]}
                    </Text>
                  </View>
                )}
                {photo?.uri && (
                  <View style={styles.checkOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  </View>
                )}
              </TouchableOpacity>

              {photo?.uri && editable && (
                <TextInput
                  style={styles.noteInput}
                  placeholder="Nota..."
                  placeholderTextColor={COLORS.textLight}
                  value={photo.note}
                  onChangeText={(text) => handleNoteChange(slot, text)}
                  multiline
                  numberOfLines={2}
                />
              )}

              <Text style={styles.slotLabel}>{PHOTO_SLOT_LABELS[slot]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  counter: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  counterComplete: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
  },
  counterIncomplete: {
    backgroundColor: COLORS.warning,
    color: COLORS.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoCard: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  checkOverlay: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.round,
  },
  noteInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
    color: COLORS.textPrimary,
    minHeight: 36,
  },
  slotLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
