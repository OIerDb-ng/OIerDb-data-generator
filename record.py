#!/usr/bin/env python3

from itertools import chain
import util
__school_penalty__ = {0: 0, 1: -40, 2: 60, 3: 120, 4: 180, 5: 300}

class Record:
    __auto_increment__ = 0

    def __init__(self, oier, contest, score, rank, level, grades, school, province, gender):
        Record.__auto_increment__ += 1
        self.id = Record.__auto_increment__
        self.oier = oier
        self.contest = contest
        self.score = score
        self.rank = rank
        self.level = level
        self.grades = grades
        self.school = school
        self.province = province
        self.gender = gender
        self.ems = util.enrollment_middle(contest, grades)
        self.keep_grade_flag = False

    def __repr__(self):
        return '{}(pro={},school={},ems={},c={})'.format(self.oier.name, self.province, self.school.name, self.ems, self.contest.name)

    @staticmethod
    def __score_format__(score):
        return '' if score is None else '{:.5g}'.format(score)

    @staticmethod
    def __province_format__(province):
        try:
            return util.provinces.index(province)
        except:
            print('\x1b[01;33mwarning: \x1b[0m未知的省级行政区：\x1b[0;32m\'{}\'\x1b[0m'.format(
                province), file = stderr)
            return province

    @staticmethod
    def __award_level_format__(level):
        try:
            return util.award_levels.index(level)
        except:
            print('\x1b[01;33mwarning: \x1b[0m未知的奖项名称：\x1b[0;32m\'{}\'\x1b[0m'.format(
                level), file = stderr)
            return level

    def to_compress_format(self):
        '转化成压缩格式字符串。'

        s = '{}:{}:{}:{}:{}:{}'.format(
            self.contest.id, self.school.id, Record.__score_format__(self.score),
            self.rank, Record.__province_format__(self.province), Record.__award_level_format__(self.level)
        )
        if self.keep_grade_flag:
            s += ':' + str(util.get_weighted_mode([self.ems])[0])
        return s

    def is_keep_grade(self):
        '获取该记录组是否为非正常年级 (如留级)。'

        return self.keep_grade_flag

    def keep_grade(self):
        '标记一个记录组为非正常年级 (如留级)，显示时保留年级。'

        self.keep_grade_flag = True

    @staticmethod
    def distance(A, B, inf = 2147483647):
        ''' 获取两个记录组的距离。

        A: 第一个记录组。
        B: 第二个记录组。
        '''

        assert len(A) and len(B)

        for a in A:
            for b in B:
                if a.contest is b.contest:
                    return inf
                if abs(a.gender - b.gender) == 2:
                    return inf
                if a.contest.school_year() == b.contest.school_year() and len(set(a.ems) & set(b.ems)) == 0:
                    return inf

        schools = set(record.school.id for record in chain(A, B))
        locations = set(record.school.location() for record in chain(A, B))
        provinces = set(record.province for record in chain(A, B))
        aem = util.get_mode([record.ems for record in A])
        bem = util.get_mode([record.ems for record in B])
        diff = min(abs(i - j) for i in aem for j in bem)

        return __school_penalty__.get(len(schools), 600)    \
            + 80 * (len(locations) + len(provinces) - 3)    \
            + 100 * diff

    @staticmethod
    def check_stay_down(A, B):
        ''' 检测两个记录组的合并是否是因为留级等现象 (需要保留年级)。

        A: 第一个记录组。
        B: 第二个记录组。

        返回值: 0 表示非留级现象，1 表示 B 是留级后的记录组，-1 表示 A 是留级后的记录组。
        '''

        assert len(A) and len(B)

        emsA = set(chain(*[record.ems.keys() for record in A]))
        emsB = set(chain(*[record.ems.keys() for record in B]))

        if not (len(emsA) == 1 and len(emsB) == 1 and len(A) > 1 and len(B) > 1):
            return 0

        aem, bem = emsA.pop(), emsB.pop()
        if abs(aem - bem) != 1:
            return 0

        if (len(A) < 2 if aem + 1 == bem else len(B) < 2):
            return 0

        schools = set(record.school.id for record in chain(A, B))
        locations = set(record.school.location() for record in chain(A, B))
        provinces = set(record.province for record in chain(A, B))
        penalty = __school_penalty__.get(len(schools), 600) + 80 * (len(locations) + len(provinces) - 3)
        if penalty >= 100:
            return 0

        return bem - aem
