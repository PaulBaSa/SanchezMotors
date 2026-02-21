import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { ActionButton } from './ActionButton';

interface PinModalProps {
  visible: boolean;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  title?: string;
}

export function PinModal({
  visible,
  onSubmit,
  onCancel,
  title = 'Ingrese PIN de Administrador',
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin.length < 4) {
      setError(true);
      return;
    }
    setError(false);
    onSubmit(pin);
    setPin('');
  };

  const handleCancel = () => {
    setPin('');
    setError(false);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={pin}
            onChangeText={(text) => {
              setPin(text);
              setError(false);
            }}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            placeholder="••••"
            placeholderTextColor={COLORS.textLight}
            autoFocus
          />

          {error && (
            <Text style={styles.errorText}>PIN debe tener al menos 4 dígitos</Text>
          )}

          <View style={styles.buttons}>
            <ActionButton
              title="Cancelar"
              onPress={handleCancel}
              variant="secondary"
              style={styles.btn}
            />
            <ActionButton
              title="Confirmar"
              onPress={handleSubmit}
              variant="primary"
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.xxl,
    textAlign: 'center',
    letterSpacing: 12,
    color: COLORS.textPrimary,
    minHeight: TOUCH_TARGET.minHeight,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  btn: {
    flex: 1,
  },
});
