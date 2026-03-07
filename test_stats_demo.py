#!/usr/bin/env python3
"""
访客统计测试演示
模拟不同 IP 访问，展示访客统计工作原理
"""

import json
import hashlib
from datetime import datetime

# 模拟服务器统计数据
stats = {
    "today": {
        "date": datetime.now().strftime("%a %b %d %Y"),
        "uniqueVisitors": 0,
        "totalVisits": 0,
        "visitorIPs": set(),  # 使用集合存储已访问的IP哈希
        "moduleUsage": {}
    },
    "total": {
        "uniqueVisitors": 0,
        "totalVisits": 0,
        "moduleUsage": {}
    }
}

def hash_ip(ip):
    """模拟服务器端的IP哈希函数"""
    hash_val = 0
    for char in ip:
        hash_val = ((hash_val << 5) - hash_val) + ord(char)
        hash_val = hash_val & 0xFFFFFFFF  # 保持32位
    return format(hash_val, '08x')

def record_visit(ip_address):
    """记录一次访问"""
    global stats
    
    # 增加总访问次数
    stats["today"]["totalVisits"] += 1
    stats["total"]["totalVisits"] += 1
    
    # 对IP进行哈希
    hashed_ip = hash_ip(ip_address)
    
    # 检查是否为新访客
    if hashed_ip not in stats["today"]["visitorIPs"]:
        stats["today"]["visitorIPs"].add(hashed_ip)
        stats["today"]["uniqueVisitors"] += 1
        stats["total"]["uniqueVisitors"] += 1
        print(f"  🆕 新访客! IP: {ip_address} (哈希: {hashed_ip})")
    else:
        print(f"  🔄 重复访问 IP: {ip_address} (哈希: {hashed_ip})")
    
    return stats

def print_stats():
    """打印当前统计"""
    print("\n" + "="*50)
    print("📊 当前访客统计")
    print("="*50)
    print(f"今日访客数: {stats['today']['uniqueVisitors']}")
    print(f"今日访问次数: {stats['today']['totalVisits']}")
    print(f"总访客数: {stats['total']['uniqueVisitors']}")
    print(f"总访问次数: {stats['total']['totalVisits']}")
    print(f"已记录IP数: {len(stats['today']['visitorIPs'])}")
    print("="*50)

def simulate_visits():
    """模拟多次访问"""
    test_ips = [
        "192.168.1.1",      # 用户A - 第一次访问
        "192.168.1.2",      # 用户B - 第一次访问
        "192.168.1.1",      # 用户A - 第二次访问（重复）
        "10.0.0.1",         # 用户C - 第一次访问
        "192.168.1.3",      # 用户D - 第一次访问
        "192.168.1.2",      # 用户B - 第二次访问（重复）
        "172.16.0.1",       # 用户E - 第一次访问
    ]
    
    print("\n🎮 开始模拟访客访问...")
    print("-"*50)
    
    for i, ip in enumerate(test_ips, 1):
        print(f"\n访问 #{i}:")
        record_visit(ip)
        print_stats()
        input("按回车继续...")
    
    print("\n✅ 模拟完成!")
    print(f"\n📈 统计结果:")
    print(f"   不同IP数量: {len(test_ips)}")
    print(f"   独立访客数: {stats['today']['uniqueVisitors']}")
    print(f"   重复访问次数: {stats['today']['totalVisits'] - stats['today']['uniqueVisitors']}")

if __name__ == "__main__":
    print("="*50)
    print("🎀 大福玩具房 - 访客统计测试演示")
    print("="*50)
    print("\n原理说明:")
    print("1. 每次页面加载会发送 POST /api/stats 请求")
    print("2. 服务器记录访问次数 (totalVisits)")
    print("3. 服务器检查IP是否已访问过")
    print("4. 新IP增加独立访客数 (uniqueVisitors)")
    print("5. 重复IP只增加访问次数，不增加访客数")
    print("\n" + "="*50)
    
    simulate_visits()
