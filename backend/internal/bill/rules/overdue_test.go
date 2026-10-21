package rules

import (
	"testing"
	"time"
)

func day(s string) time.Time {
	t, err := time.ParseInLocation("2006-01-02", s, time.Local)
	if err != nil {
		panic(err)
	}
	return t
}

func TestIsOverdueBoundary(t *testing.T) {
	cases := []struct {
		name   string
		status string
		period string
		today  string
		want   bool
	}{
		{"day 7 is not overdue", "unpaid", "2026-10", "2026-10-07", false},
		{"day 8 is overdue", "unpaid", "2026-10", "2026-10-08", true},
		{"after overdue day stays overdue", "unpaid", "2026-10", "2026-10-30", true},
		{"month before is not overdue yet", "unpaid", "2026-10", "2026-09-30", false},
		{"partial past overdue day", "partial", "2026-09", "2026-10-08", true},
		{"paid is never overdue", "paid", "2026-09", "2026-10-20", false},
		{"void is never overdue", "void", "2026-09", "2026-10-20", false},
		{"stored overdue is overdue", "overdue", "2026-10", "2026-10-01", true},
		{"malformed period is not overdue", "unpaid", "2026-1", "2026-10-20", false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := IsOverdue(tc.status, tc.period, 8, day(tc.today)); got != tc.want {
				t.Fatalf("IsOverdue(%q, %q, 8, %s) = %v, want %v", tc.status, tc.period, tc.today, got, tc.want)
			}
		})
	}
}

func TestOverdueDateFormatsTwoDigits(t *testing.T) {
	if got := OverdueDate("2026-10", 8); got != "2026-10-08" {
		t.Fatalf("OverdueDate = %q, want 2026-10-08", got)
	}
}

func TestDisplayStatusPriority(t *testing.T) {
	cases := []struct {
		name    string
		status  string
		pending int64
		overdue bool
		want    string
	}{
		{"paid wins over everything", "paid", 1, true, DisplayPaid},
		{"void wins over pending", "void", 1, true, DisplayVoid},
		{"pending proof beats overdue", "unpaid", 1, true, DisplayPendingReview},
		{"overdue", "unpaid", 0, true, DisplayOverdue},
		{"plain unpaid", "unpaid", 0, false, DisplayUnpaid},
		{"partial not overdue shows unpaid", "partial", 0, false, DisplayUnpaid},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := DisplayStatus(tc.status, tc.pending, tc.overdue); got != tc.want {
				t.Fatalf("DisplayStatus = %q, want %q", got, tc.want)
			}
		})
	}
}
