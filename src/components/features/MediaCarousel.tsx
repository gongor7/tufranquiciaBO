import { useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

interface MediaCarouselProps {
  images: string[];
  logoEmoji: string;
}

/** Carrusel estilo tienda con indicador de posición (RF-48), sin dependencias. */
export function MediaCarousel({ images, logoEmoji }: MediaCarouselProps) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<string>>(null);

  const onScroll = (event: { nativeEvent: { contentOffset: { x: number }; layoutMeasurement: { width: number } } }) => {
    const next = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width,
    );
    if (next !== index) {
      setIndex(next);
    }
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, i) => `gallery-${i}-${item.slice(-12)}`}
        onScroll={onScroll}
        getItemLayout={(_, i) => ({ length: images.length ? 1 : 0, offset: 0, index: i })}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item }} style={StyleSheet.absoluteFill} />
            <View style={styles.overlay} />
            <View style={styles.emojiBadge}>
              <Text style={styles.emoji}>{logoEmoji}</Text>
            </View>
          </View>
        )}
      />
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View key={`dot-${i}`} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 250,
    position: 'relative',
  },
  slide: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(77,3,20,0.30)',
  },
  emojiBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: {
    fontSize: 28,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 18,
  },
});
