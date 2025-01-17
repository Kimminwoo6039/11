"use client";

import React, {createContext, ReactNode, useEffect, useRef, useState} from 'react';
import {useToast} from "@/hooks/use-toast";
import YOLOv8 from "@/components/detection/yolo-8v-detection";
import {useScreenShare} from "@/lib/provider/screen-share-context";

const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

interface GamblingContextValue {
  urlHistory: UrlHistoryItem[];
}

export interface DetectionResult {
  result: "통과" | "도박" | "차단";
  score: number;
  weight: number;
  word_list: string[];
}

export interface UrlHistoryItem {
  url: string;
  title: string;
  content: string;
  screenshot?: string;
  검출유무?: number;
}

export interface DetectionItem extends UrlHistoryItem {
  id?: number;
  detectedAt: Date;
  score: number;
  timestamp?: string;
}

const GamblingContext = createContext<GamblingContextValue>({urlHistory: []});

export function GamblingProvider({children}: { children: ReactNode }) {
  const [urlHistory, setUrlHistory] = useState<UrlHistoryItem[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const processedUrls = useRef<Set<string>>(new Set());
  const {toast} = useToast();

  const {setCapturedFile} = useScreenShare();

  class GamblingDetector {
    private cutline: number = 100;
    private wordGroupAScore: number = 90;
    private wordGroupBScore: number = 50;
    private wordGroupCScore: number = 20;

    private wordGroupA: string[] = [
      "첫충", "단폴", "다리다리", "매충", "꽁머니", "슈어맨",
      "다음드", "한폴낙", "두폴낙", "단폴", "프리벳"
    ];

    private wordGroupB: string[] = [
      "카지노", "슬롯", "바카라", "블랙잭", "잭팟", "포커",
      "섯다", "화투", "홀덤", "배팅", "베팅", "토토",
      "라이브카지노", "입금보너스", "멀티베팅", "승자예상"
    ];

    private wordGroupC: string[] = [
      "이벤트", "사다리", "스포츠", "충전", "지급", "도박",
      "포인트", "입출금", "게임", "토큰", "인플레이", "토너먼트"
    ];

    private urlBlacklist = [
      "www.bwzx",
      "www.bet16",
      "1bet1.bet",
      "10x10v2a.com"
    ];

    private urlWhitelist = [
      "naver.com", "daum.net", "coupang.com", "ticketmonster.co.kr", "google.com",
      "baedalMinjok.com", "gmarket.co.kr", "auction.co.kr", "nate.com",
      "aladin.co.kr", "interpark.com", "ridibooks.com", "zigbang.com",
      "kakaocorp.com", "melon.com", "tistory.com", "hani.co.kr",
      "mycelebs.com", "cgv.co.kr", "baedal.com", "hankyung.com",
      "news1.kr", "mnet.com", "onmap.co.kr", "friends.co.kr",
      "kgc.co.kr", "ehmart.com", "viralmarketing.co.kr", "kurly.com",
      "hankookilbo.com", "dcinside.com", "kofic.or.kr", "yna.co.kr",
      "incheonilbo.com", "seoul.co.kr", "donga.com", "chosun.com",
      "sisain.com", "sportsseoul.com", "kbs.co.kr", "jtbc.joins.com",
      "jtbc.com", "imbc.com", "tvchosun.com", "kukinews.com", "hani.co.kr",
      "inews24.com", "news1.kr"
    ];

    public gamble(content: string, url: string): DetectionResult {
      const [gambleScore, gambleWords] = this.score(content.trim().toLowerCase().replace(/\s+/g, ''));
      const gambleWeight = this.weight(url);

      return {
        result: gambleWeight === 0.0 ? "차단" :
            gambleScore >= this.cutline * gambleWeight ? "도박" : "통과",
        score: gambleScore,
        weight: gambleWeight,
        word_list: gambleWords
      };
    }

    private score(content: string): [number, string[]] {
      const gambleWords: string[] = [];
      let gambleScore = 0;

      this.wordGroupA.forEach(word => {
        if (content.includes(word)) {
          gambleScore += this.wordGroupAScore;
          gambleWords.push(word);
        }
      });

      this.wordGroupB.forEach(word => {
        if (content.includes(word)) {
          gambleScore += this.wordGroupBScore;
          gambleWords.push(word);
        }
      });

      this.wordGroupC.forEach(word => {
        if (content.includes(word)) {
          gambleScore += this.wordGroupCScore;
          gambleWords.push(word);
        }
      });

      return [gambleScore, gambleWords];
    }

    private weight(url: string): number {
      const PKG_WHITELIST_WEIGHT = 5.0;  // 화이트리스트 둔감하게
      const PKG_BLACKLIST_WEIGHT = 0.0;  // 블랙리스트 즉시차단

      let gambleWeight = 1.0;

      // Check url blacklist
      if (this.urlBlacklist.some(blacklist => url.includes(blacklist))) {
        gambleWeight = PKG_BLACKLIST_WEIGHT;
      }
      // Check url whitelist
      if (this.urlWhitelist.some(whitelist => url.includes(whitelist))) {
        gambleWeight = PKG_WHITELIST_WEIGHT;
      }
      return gambleWeight;
    }
  }

  const initBlcokDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BlockedSitesDB', 1); // 버전을 2로 증가

      request.onerror = () => {
        console.error("DB Error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log("DB Opened successfully");
        resolve(request.result);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        console.log("Upgrading database...");
        const db = (event.target as IDBOpenDBRequest).result;

        // 기존 스토어가 있다면 삭제
        if (db.objectStoreNames.contains('blockedSites')) {
          db.deleteObjectStore('blockedSites');
        }

        // 새 스토어 생성
        const store = db.createObjectStore('blockedSites', {
          keyPath: 'url',
          autoIncrement: false
        });

        // 인덱스 생성
        store.createIndex('blockedAt', 'blockedAt', {unique: false});
        store.createIndex('unblockTime', 'unblockTime', {unique: false});
        store.createIndex('duration', 'duration', {unique: false});

        console.log("Store created:", store);
      };
    });
  };

  const initDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      // 버전을 2로 올려서 스키마 변경
      const request = indexedDB.open('GamblingDetectionDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 새로운 스토어 생성
        const store = db.createObjectStore('detections', {
          keyPath: 'id',
          autoIncrement: true
        });

        // 인덱스 생성 - unique 제약 조건 제거
        store.createIndex('url', 'url', {unique: false});
        store.createIndex('detectedAt', 'detectedAt', {unique: false});
        store.createIndex('title', 'title', {unique: false});
        store.createIndex('score', 'score', {unique: false});
      };
    });
  };
  type NotificationType = 'adult' | 'inappropriate' | 'spam';

  // 알림 전송
  const sendNotification = async (type: NotificationType, message: string) => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const notificationOptions: {
        inappropriate: { icon: string; title: string };
        adult: { icon: string; title: string };
        spam: { icon: string; title: string }
      } = {
        adult: {
          title: "🚨 성인 콘텐츠 감지",
          icon: '/meer.ico'
        },
        inappropriate: {
          title: "⚠️ 부적절 콘텐츠",
          icon: '/meer.ico'
        },
        spam: {
          title: "🚫 스팸 감지",
          icon: '/meer.ico'
        }
      };

      const options = {
        body: message,
        ...notificationOptions[type],
        tag: type,
        requireInteraction: false,
        icon: '/meer.ico'
      };

      try {
        const notification = new Notification(options.title, options);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => notification.close(), 3000);
      } catch (error) {
        console.error('알림 생성 실패:', error);
      }
    } else {
    }
  };

  const saveToBlockedSitesDB = async (url: string, duration: number) => {
    try {
      const db = await initBlcokDB();
      const transaction = db.transaction('blockedSites', 'readwrite');
      const store = transaction.objectStore('blockedSites');

      const blockedSite = {
        url,
        blockedAt: new Date(),
        unblockTime: new Date(Date.now() + duration * 60 * 1000),
        duration: duration
      };

      await store.put(blockedSite);
      console.log('Site saved to BlockedSitesDB:', blockedSite);
    } catch (error) {
      console.error('Error saving to BlockedSitesDB:', error);
    }
  };


  const saveDetection = async (detection: Omit<DetectionItem, 'id'>): Promise<number> => {
    const db = await initDB();
    const transaction = db.transaction('detections', 'readwrite');

    return new Promise((resolve, reject) => {
      try {
        const store = transaction.objectStore('detections');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const existingDetections = getAllRequest.result;

          if (existingDetections.length > 0) {
            const lastDetection = existingDetections[existingDetections.length - 1];

            // URL 중복 체크
            if (lastDetection.url === detection.url) {
              console.log('Duplicate URL found, skipping save');
              resolve(-1);
              return;
            }
              //yolodecteion 로직 
            // 오래된 레코드 삭제 (최대 10개만 유지)
            if (existingDetections.length >= 9) {
              const oldKeys = existingDetections
                .slice(0, existingDetections.length - 9)
                .map(record => record.id);
              
              for (const key of oldKeys) {
                store.delete(key);
              }
            }
          }

          // 새로운 감지 기록 저장
          const newDetection = {
            ...detection,
            timestamp: new Date().toISOString(),
            id: Date.now()
          };

          const addRequest = store.add(newDetection);

          addRequest.onsuccess = () => {
            console.log('Detection saved successfully');
            resolve(addRequest.result as number);
          };

          addRequest.onerror = () => reject(addRequest.error);
        };

        getAllRequest.onerror = () => reject(getAllRequest.error);

      } catch (error) {
        console.error('저장 오류:', error);
        reject(error);
      } finally {
        transaction.oncomplete = () => db.close();
      }
    });
  };
  useEffect(() => {
    const messageListener = async (event: MessageEvent) => {
      if (event.data.type === "HHH" && event.data.source === EXTENSION_IDENTIFIER) {
        const currentData = event.data.data.data as UrlHistoryItem[];

        if (currentData[0]?.title === "meerCat.ch") {
          setIsPaused(true);
          return;
        }


        setIsPaused(false);

        // 스크린샷 처리
        if (currentData[0]?.screenshot) {
          try {
            const response = await fetch(currentData[0].screenshot);
            const blob = await response.blob();
            const file = new File([blob], 'screenshot.png', {type: 'image/png'});
            setCapturedFile(file);
          } catch (error) {
            console.error('스크린샷 처리 오류:', error);
          }
        }

        // 도박 감지 처리
        const content = currentData[0]?.content;
        const currentUrl = currentData[0]?.url;

        console.log("ㅋㅋ")

        // if (content && currentUrl && !processedUrls.current.has(currentUrl)) {

        if (content) {
          const detector = new GamblingDetector();
          const result = detector.gamble(content, currentUrl);
          if (result.result !== "통과") {
            await saveDetection({
              url: currentData[0].url,
              title: currentData[0].title,
              screenshot: currentData[0].screenshot,
              content: currentData[0].content,
              detectedAt: new Date(),
              score: result.score
            });

            currentData[0].검출유무 = 1;
            sendNotification('inappropriate', '도박 콘텐츠가 감지되었습니다.');
            toast({
              title: "도박 컨텐츠 감지",
              description: "도박 관련 컨텐츠가 검출되었습니다.",
              variant: "destructive",
            });

            // window.postMessage(
            //     {
            //       type: "block",
            //       source: "block",
            //       identifier: EXTENSION_IDENTIFIER,
            //       data: currentData[0].url,
            //       duration: '1'
            //     },
            //     "*"
            // );

            // // BlockedSitesDB에도 저장
            // await saveToBlockedSitesDB(currentData[0].url, 1); // 10분 차단


          }
        }

        if (currentUrl) {
          processedUrls.current.add(currentUrl);
        }
        setUrlHistory(currentData);
      }
    };

    window.addEventListener("message", messageListener);

    const requestData = () => {
      window.postMessage(
          {
            type: "HHH",
            source: "HHH",
            identifier: EXTENSION_IDENTIFIER,
          },
          "*"
      );
    };


    requestData();
    const intervalId = setInterval(requestData, 1000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("message", messageListener);
    };
  }, [isPaused, toast]);

  return (
      <GamblingContext.Provider value={{urlHistory}}>
        <YOLOv8 urlHistory={urlHistory}/>
        {children}
      </GamblingContext.Provider>
  );
}

export const useGambling = () => {
  const context = React.useContext(GamblingContext);
  if (context === undefined) {
    throw new Error('useGambling must be used within a GamblingProvider');
  }
  return context;
};