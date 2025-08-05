import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DayActivity {
  date: string;
  hasFoodLogs: boolean;
  hasStoolLogs: boolean;
  foodCount: number;
  stoolCount: number;
  foodLogs: any[];
  stoolLogs: any[];
}

interface MonthlyActivityCalendarProps {
  foodLogs: any[];
  stoolLogs: any[];
}

const MonthlyActivityCalendar = ({ foodLogs, stoolLogs }: MonthlyActivityCalendarProps) => {
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayActivities, setDayActivities] = useState<Map<string, DayActivity>>(new Map());

  useEffect(() => {
    calculateMonthlyActivities();
  }, [foodLogs, stoolLogs, currentMonth]);

  const calculateMonthlyActivities = () => {
    const activities = new Map<string, DayActivity>();
    
    // Get all days in current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    monthDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Filter logs for this specific day
      const dayFoodLogs = foodLogs.filter(log => {
        const logDate = format(parseISO(log.created_at), 'yyyy-MM-dd');
        return logDate === dateStr;
      });

      const dayStoolLogs = stoolLogs.filter(log => {
        const logDate = format(parseISO(log.created_at), 'yyyy-MM-dd');
        return logDate === dateStr;
      });

      activities.set(dateStr, {
        date: dateStr,
        hasFoodLogs: dayFoodLogs.length > 0,
        hasStoolLogs: dayStoolLogs.length > 0,
        foodCount: dayFoodLogs.length,
        stoolCount: dayStoolLogs.length,
        foodLogs: dayFoodLogs,
        stoolLogs: dayStoolLogs
      });
    });

    setDayActivities(activities);
  };

  const getActivityLevel = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const activity = dayActivities.get(dateStr);
    
    if (!activity) return 'none';
    
    if (activity.hasFoodLogs && activity.hasStoolLogs) return 'both';
    if (activity.hasFoodLogs) return 'food';
    if (activity.hasStoolLogs) return 'stool';
    return 'none';
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const activity = dayActivities.get(dateStr);
    
    if (activity && (activity.hasFoodLogs || activity.hasStoolLogs)) {
      setSelectedDate(date);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const selectedActivity = selectedDate ? dayActivities.get(format(selectedDate, 'yyyy-MM-dd')) : null;

  return (
    <>
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" style={{ color: '#4A7C59' }} />
              <span style={{ color: '#2E2E2E' }}>{t('analytics.monthlyActivityCalendar')}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] sm:min-w-[120px] text-center" style={{ color: '#2E2E2E' }}>
                {format(currentMonth, 'MMM yyyy', { locale: i18n.language === 'zh' ? zhCN : undefined })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="p-2"
                disabled={currentMonth >= new Date()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="overflow-x-auto">
            <Calendar
              locale={i18n.language === 'zh' ? zhCN : undefined}
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full pointer-events-auto text-sm mx-auto max-w-full"
              modifiers={{
                hasFood: (date) => getActivityLevel(date) === 'food',
                hasStool: (date) => getActivityLevel(date) === 'stool',
                hasBoth: (date) => getActivityLevel(date) === 'both',
                hasActivity: (date) => getActivityLevel(date) !== 'none'
              }}
              modifiersStyles={{
                hasFood: { 
                  backgroundColor: '#E8F5E8',
                  color: '#2E7D32',
                  fontWeight: 'bold'
                },
                hasStool: { 
                  backgroundColor: '#FFF3E0',
                  color: '#F57C00',
                  fontWeight: 'bold'
                },
                hasBoth: { 
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                  fontWeight: 'bold'
                }
              }}
              onDayClick={handleDateClick}
              disabled={(date) => date > new Date()}
            />
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs justify-center sm:justify-start">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#E8F5E8' }}></div>
              <span style={{ color: '#2E2E2E' }}>{t('history.foodEntry')}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FFF3E0' }}></div>
              <span style={{ color: '#2E2E2E' }}>{t('history.stoolEntry')}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#E3F2FD' }}></div>
              <span style={{ color: '#2E2E2E' }}>已记录两项</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: i18n.language === 'zh' ? zhCN : undefined })}
            </DialogTitle>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4">
              {/* Food Logs Section */}
              {selectedActivity.hasFoodLogs && (
                <div>
                  <h4 className="font-medium text-sm mb-2" style={{ color: '#4A7C59' }}>
                    {t('history.foodLog')} ({selectedActivity.foodCount})
                  </h4>
                  <div className="space-y-2">
                    {selectedActivity.foodLogs.map((log, index) => (
                      <div key={index} className="p-2 rounded border" style={{ borderColor: '#E8F5E8', backgroundColor: '#F8FDF8' }}>
                        <p className="font-medium text-sm">{log.food_name}</p>
                        {log.description && (
                          <p className="text-xs text-gray-600">{log.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {format(parseISO(log.created_at), 'h:mm a', { locale: i18n.language === 'zh' ? zhCN : undefined })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stool Logs Section */}
              {selectedActivity.hasStoolLogs && (
                <div>
                  <h4 className="font-medium text-sm mb-2" style={{ color: '#F57C00' }}>
                    {t('history.stoolLog')} ({selectedActivity.stoolCount})
                  </h4>
                  <div className="space-y-2">
                    {selectedActivity.stoolLogs.map((log, index) => (
                      <div key={index} className="p-2 rounded border" style={{ borderColor: '#FFF3E0', backgroundColor: '#FFFBF5' }}>
                        <div className="flex justify-between text-sm">
                          <span>{t('history.bristolType')}: {log.bristol_type}</span>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(log.created_at), 'h:mm a', { locale: i18n.language === 'zh' ? zhCN : undefined })}
                          </span>
                        </div>
                        {log.color && (
                          <p className="text-xs">{t('history.color')}: {log.color}</p>
                        )}
                        {log.consistency && (
                          <p className="text-xs">{t('history.consistency')}: {log.consistency}</p>
                        )}
                        {log.notes && (
                          <p className="text-xs text-gray-600 mt-1">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!selectedActivity.hasFoodLogs && !selectedActivity.hasStoolLogs && (
                <div className="text-center py-4 text-gray-500">
                  <p>此日期没有记录</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyActivityCalendar;