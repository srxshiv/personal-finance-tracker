"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpendingInsight } from '@/types/budget';
import { Lightbulb, TrendingUp, AlertTriangle, Trophy, Info } from 'lucide-react';

interface SpendingInsightsProps {
  insights: SpendingInsight[];
}

export default function SpendingInsights({ insights }: SpendingInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-green-600" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-purple-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-orange-500 bg-orange-50';
      case 'achievement':
        return 'border-l-green-500 bg-green-50';
      case 'trend':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-purple-500 bg-purple-50';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'achievement':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'trend':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">No insights available</p>
            <p className="text-sm">Add more transactions to get personalized insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 border-l-4 rounded-lg ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    {insight.category && (
                      <Badge className={`mt-1 ${getBadgeColor(insight.type)}`}>
                        {insight.category}
                      </Badge>
                    )}
                  </div>
                </div>
                {insight.value && (
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {insight.value}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}